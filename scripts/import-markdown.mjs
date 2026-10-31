import { readFile, readdir, realpath } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs as nodeParseArgs, parseEnv } from "node:util";
import { createHash } from "node:crypto";
import { createClient } from "@sanity/client";
import { fromMarkdown } from "mdast-util-from-markdown";
import { parse as parseYaml } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
const hash = (value) =>
  createHash("sha256").update(value).digest("hex").slice(0, 24);

export function parseArgs(args) {
  const { values } = nodeParseArgs({
    args,
    options: {
      env: {
        type: "string",
        default: resolve(homedir(), ".config/sanity/blog-pet.env"),
      },
      source: {
        type: "string",
        default: resolve(root, "tmp/uribou123-blog-pet/blog_md"),
      },
      images: {
        type: "string",
        default: resolve(root, "tmp/uribou123-blog-pet/blog/images"),
      },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", default: false },
    },
  });
  for (const name of ["env", "source", "images"]) {
    if (!values[name].trim()) throw new Error(`--${name} requires a path`);
    values[name] = resolve(values[name].replace(/^~(?=\/)/, homedir()));
  }
  return values;
}

export function parseArticle(source) {
  const match = source.match(
    /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/,
  );
  if (!match) throw new Error("YAML front matter is required");
  const meta = parseYaml(match[1]);
  if (
    typeof meta?.title !== "string" ||
    !meta.title.trim() ||
    !Number.isSafeInteger(meta.wordpress_id) ||
    meta.wordpress_id < 1
  )
    throw new Error("title and positive integer wordpress_id are required");
  if (
    typeof meta.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(meta.date) ||
    !Number.isFinite(Date.parse(`${meta.date}T00:00:00+09:00`))
  )
    throw new Error("date must be YYYY-MM-DD");
  const categories = meta.categories ?? [];
  if (
    !Array.isArray(categories) ||
    categories.some((name) => typeof name !== "string" || !name.trim())
  )
    throw new Error("categories must contain nonempty strings");
  const tree = fromMarkdown(match[2]);
  function text(node) {
    return node.type === "image"
      ? ""
      : (node.value ?? node.children?.map(text).join("") ?? "");
  }
  const excerpt = tree.children
    .map(text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
  if (!excerpt) throw new Error("article text is required for excerpt");
  return {
    tree,
    categories: [...new Set(categories)],
    document: {
      _id: `drafts.wordpress-post-${meta.wordpress_id}`,
      _type: "post",
      title: meta.title.trim(),
      slug: { _type: "slug", current: `wordpress-${meta.wordpress_id}` },
      excerpt,
      publishedAt: new Date(`${meta.date}T00:00:00+09:00`).toISOString(),
    },
  };
}

export async function convertBody(tree, image) {
  const result = [];
  let sequence = 0;
  const key = () => `k${sequence++}`;
  async function block(node, style = "normal", extra = {}) {
    let children = [];
    const markDefs = [];
    const flush = () => {
      if (children.length)
        result.push({
          _type: "block",
          _key: key(),
          style,
          ...extra,
          markDefs: [...markDefs],
          children,
        });
      children = [];
    };
    async function inline(node, marks = []) {
      if (node.type === "image") {
        flush();
        result.push({ ...(await image(node)), _key: key() });
        return;
      }
      if (
        node.type === "text" ||
        node.type === "inlineCode" ||
        node.type === "break"
      ) {
        children.push({
          _type: "span",
          _key: key(),
          text: node.type === "break" ? "\n" : node.value,
          marks: node.type === "inlineCode" ? [...marks, "code"] : marks,
        });
        return;
      }
      let next = marks;
      if (node.type === "strong" || node.type === "emphasis")
        next = [...marks, node.type === "strong" ? "strong" : "em"];
      else if (node.type === "link") {
        // Linked photographs become native images; image links are not part of the current schema.
        if (!node.children.every((child) => child.type === "image")) {
          const id = key();
          markDefs.push({ _type: "link", _key: id, href: node.url });
          next = [...marks, id];
        }
      } else if (node.type !== "paragraph" && node.type !== "heading")
        throw new Error(`Unsupported Markdown: ${node.type}`);
      for (const child of node.children) await inline(child, next);
    }
    await inline(node);
    flush();
  }
  async function visit(node, extra = {}) {
    if (node.type === "root" || node.type === "listItem") {
      for (const child of node.children) await visit(child, extra);
    } else if (node.type === "paragraph" || node.type === "heading")
      await block(
        node,
        node.type === "heading" ? (node.depth <= 2 ? "h2" : "h3") : "normal",
        extra,
      );
    else if (node.type === "list") {
      for (const child of node.children)
        await visit(child, {
          listItem: node.ordered ? "number" : "bullet",
          level: (extra.level ?? 0) + 1,
        });
    } else if (node.type === "code")
      result.push({
        _type: "codeBlock",
        _key: key(),
        language: node.lang || "text",
        code: node.value,
      });
    else throw new Error(`Unsupported Markdown: ${node.type}`);
  }
  await visit(tree);
  return result;
}

export async function main(
  args = process.argv.slice(2),
  clientFactory = createClient,
) {
  const options = parseArgs(args);
  if (options.help) {
    console.log(
      "Usage: node scripts/import-markdown.mjs [--env PATH] [--source DIR] [--images DIR] [--dry-run]\nDefault env: ~/.config/sanity/blog-pet.env\nWithout --dry-run, upload images and create missing drafts. Existing documents are skipped.",
    );
    return;
  }
  // Parse as data: never source/execute the file or copy its secrets into process.env.
  const env = parseEnv(await readFile(options.env, "utf8"));
  for (const name of [
    "SANITY_PROJECT_ID",
    "SANITY_DATASET",
    ...(options["dry-run"] ? [] : ["SANITY_WRITE_TOKEN"]),
  ]) {
    if (!env[name]?.trim()) throw new Error(`Missing ${name} in env file`);
  }
  const imageRoot = await realpath(options.images);
  const images = new Map();
  const articles = [];
  const ids = new Set();
  const errors = [];
  let altFallbacks = 0;
  for (const file of (await readdir(options.source))
    .filter((name) => name.endsWith(".md"))
    .sort()) {
    try {
      const article = parseArticle(
        await readFile(resolve(options.source, file), "utf8"),
      );
      if (ids.has(article.document._id))
        throw new Error("Duplicate wordpress_id");
      ids.add(article.document._id);
      article.document.body = await convertBody(article.tree, async (node) => {
        const filename = basename(
          decodeURIComponent(
            new URL(node.url, "https://legacy.invalid/").pathname,
          ),
        );
        const path = await realpath(resolve(imageRoot, filename)).catch(() => {
          errors.push(`${file}: Missing image: ${filename}`);
          return resolve(imageRoot, filename);
        });
        if (!path.startsWith(imageRoot + sep))
          throw new Error("Image escapes image directory");
        images.set(path, null);
        if (!node.alt?.trim()) altFallbacks++;
        return {
          _type: "image",
          alt: (
            node.alt?.trim() || `${article.document.title}の写真（要確認）`
          ).slice(0, 160),
          asset: { _type: "reference", _ref: path },
        };
      });
      articles.push(article);
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
    }
  }
  console.log(
    `Validated ${articles.length} articles, ${images.size} images; ${altFallbacks} generated alt texts require review.`,
  );
  if (errors.length) {
    for (const error of errors) console.error(error);
    throw new Error(
      "Preflight failed; no Sanity requests were made. Resolve missing images/content and retry.",
    );
  }
  if (!articles.length) throw new Error("No Markdown articles found");
  if (options["dry-run"]) {
    console.log("Dry run complete; no Sanity requests were made.");
    return;
  }
  const client = clientFactory({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: env.SANITY_API_VERSION || "2025-01-01",
    token: env.SANITY_WRITE_TOKEN,
    useCdn: false,
    perspective: "raw",
  });
  let created = 0;
  for (const article of articles) {
    const doc = article.document;
    const existing = await client.getDocuments([
      doc._id,
      doc._id.replace(/^drafts\./, ""),
    ]);
    if (existing.some(Boolean)) {
      console.log(`Skip existing: ${doc._id}`);
      continue;
    }
    const categories = [];
    for (const name of article.categories) {
      const id = `wordpress-category-${hash(name)}`;
      const existingCategory = await client.getDocuments([`drafts.${id}`, id]);
      if (!existingCategory.some(Boolean))
        await client.createIfNotExists({
          _id: `drafts.${id}`,
          _type: "category",
          name,
          slug: { _type: "slug", current: `category-${hash(name)}` },
        });
      categories.push({
        _type: "reference",
        _key: hash(name),
        _ref: id,
        _weak: true,
      });
    }
    for (const block of doc.body) {
      if (block._type !== "image") continue;
      const path = block.asset._ref;
      if (!images.get(path)) {
        const asset = await client.assets.upload(
          "image",
          await readFile(path),
          { filename: basename(path) },
        );
        images.set(path, asset._id);
      }
      block.asset._ref = images.get(path);
    }
    // createIfNotExists never overwrites a draft edited in Studio, including on retries.
    await client.createIfNotExists({ ...doc, categories });
    console.log(`Imported draft: ${doc._id}`);
    created++;
  }
  console.log(
    `Finished: ${created} draft articles imported. Review alt texts and publish categories before articles in Studio.`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    // API errors can contain request headers; do not print raw SDK errors or credentials.
    console.error(
      error.statusCode
        ? `Sanity request failed (HTTP ${error.statusCode}). Check permissions and connection; retry safely.`
        : error.message,
    );
    process.exitCode = 1;
  });
}
