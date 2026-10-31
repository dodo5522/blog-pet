import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseArgs,
  parseArticle,
  convertBody,
  main,
} from "../scripts/import-markdown.mjs";

test("CLI reads the specified env and imports drafts once without overwriting", async () => {
  const dir = await mkdtemp(join(tmpdir(), "blog-pet-import-"));
  try {
    await mkdir(join(dir, "posts"));
    await mkdir(join(dir, "images"));
    await writeFile(
      join(dir, "settings.env"),
      'SANITY_PROJECT_ID=test123\nSANITY_DATASET=testing\nSANITY_WRITE_TOKEN="fake-test-token"\n',
    );
    await writeFile(
      join(dir, "posts", "post.md"),
      '---\ntitle: 猫\ndate: "2019-09-07"\nwordpress_id: 1\ncategories: [日記]\n---\n\n写真です。![](https://old.example/cat.jpg)',
    );
    await writeFile(join(dir, "images", "cat.jpg"), "fixture");
    const stored = new Map();
    let uploads = 0;
    let connections = 0;
    const clientFactory = (config) => {
      connections++;
      assert.equal(config.token, "fake-test-token");
      assert.equal(config.dataset, "testing");
      return {
        getDocuments: async (ids) => ids.map((id) => stored.get(id) ?? null),
        createIfNotExists: async (doc) => {
          if (!stored.has(doc._id)) stored.set(doc._id, structuredClone(doc));
        },
        assets: {
          upload: async () => {
            uploads++;
            return { _id: "image-fixture" };
          },
        },
      };
    };
    const args = [
      "--env",
      join(dir, "settings.env"),
      "--source",
      join(dir, "posts"),
      "--images",
      join(dir, "images"),
    ];
    await main([...args, "--dry-run"], clientFactory);
    assert.equal(connections, 0);
    await main(args, clientFactory);
    assert.ok([...stored.keys()].every((id) => id.startsWith("drafts.")));
    assert.equal(
      stored.get("drafts.wordpress-post-1").body[1].asset._ref,
      "image-fixture",
    );
    stored.get("drafts.wordpress-post-1").title = "Studioで編集";
    await main(args, clientFactory);
    assert.equal(uploads, 1);
    assert.equal(stored.get("drafts.wordpress-post-1").title, "Studioで編集");
    await rm(join(dir, "images", "cat.jpg"));
    await assert.rejects(main(args, clientFactory), /Preflight failed/);
    assert.equal(connections, 2);
    const categoryId = [...stored.keys()].find((id) =>
      id.startsWith("drafts.wordpress-category-"),
    );
    const publishedId = categoryId.replace(/^drafts\./, "");
    stored.set(publishedId, {
      ...stored.get(categoryId),
      _id: publishedId,
      name: "Studioで変更",
    });
    stored.delete(categoryId);
    await writeFile(join(dir, "images", "cat.jpg"), "fixture");
    const articlePath = join(dir, "posts", "post.md");
    await writeFile(
      articlePath,
      '---\ntitle: 別記事\ndate: "2019-09-07"\nwordpress_id: 2\ncategories: [日記]\n---\n\n別の記事',
    );
    await main(args, clientFactory);
    assert.equal(stored.has(categoryId), false);
    assert.equal(stored.get(publishedId).name, "Studioで変更");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("env path has a home default and supports an explicit override", () => {
  assert.match(parseArgs([]).env, /\.config\/sanity\/blog-pet\.env$/);
  assert.equal(parseArgs(["--env", "/tmp/custom.env"]).env, "/tmp/custom.env");
  assert.throws(() => parseArgs(["--env"]));
  assert.throws(() => parseArgs(["--unknown"]));
});

test("published WordPress exports become stable draft documents with JST dates", async () => {
  const article = parseArticle(
    '---\ntitle: 猫\ndate: "2019-09-07"\nwordpress_id: 719\nstatus: publish\ncategories: [日記]\n---\n\nこんにちは **猫**。',
  );
  assert.equal(article.document._id, "drafts.wordpress-post-719");
  assert.equal(article.document.publishedAt, "2019-09-06T15:00:00.000Z");
  assert.equal(article.document.slug.current, "wordpress-719");
  const body = await convertBody(article.tree, async () =>
    assert.fail("no image"),
  );
  assert.equal(body[0].children[1].text, "猫");
  assert.deepEqual(body[0].children[1].marks, ["strong"]);
});

test("inline and linked images preserve their position and receive alt text", async () => {
  const article = parseArticle(
    '---\ntitle: 猫\ndate: "2019-09-07"\nwordpress_id: 1\n---\n\n前![](https://example.com/a.jpg)後\n\n[![猫](https://example.com/b.jpg)](https://example.com/b.jpg)',
  );
  const body = await convertBody(article.tree, async (node) => ({
    _type: "image",
    alt: node.alt || "要確認",
    asset: { _type: "reference", _ref: "image-test" },
  }));
  assert.deepEqual(
    body.map((block) => block._type),
    ["block", "image", "block", "image"],
  );
  assert.equal(body[1].alt, "要確認");
});

test("unsupported HTML fails rather than silently losing content", async () => {
  const article = parseArticle(
    '---\ntitle: 猫\ndate: "2019-09-07"\nwordpress_id: 1\n---\n\n<iframe src="x"></iframe>',
  );
  await assert.rejects(
    convertBody(article.tree, async () => {}),
    /Unsupported/,
  );
});

test("fenced code is retained using the existing codeBlock schema", async () => {
  const article = parseArticle(
    '---\ntitle: 猫\ndate: "2019-09-07"\nwordpress_id: 1\n---\n\n```\n書類名\n```',
  );
  const body = await convertBody(article.tree, async () => {});
  assert.equal(body[0]._type, "codeBlock");
  assert.equal(body[0].code, "書類名");
  assert.equal(body[0].language, "text");
});

test("links spanning an inline image remain defined after splitting the paragraph", async () => {
  const article = parseArticle(
    '---\ntitle: 猫\ndate: "2019-09-07"\nwordpress_id: 1\n---\n\n[前 ![猫](https://example.com/cat.jpg) 後](https://example.com)',
  );
  const body = await convertBody(article.tree, async () => ({
    _type: "image",
  }));
  for (const block of body.filter((item) => item._type === "block")) {
    assert.equal(
      block.markDefs.find((mark) => mark._key === block.children[0].marks[0])
        ?.href,
      "https://example.com",
    );
  }
});
