import { defineArrayMember, defineField, defineType } from "sanity";

const servicePageKinds = [
  { title: "ご利用方法", value: "usage" },
  { title: "料金", value: "price" },
  { title: "アクセス・対応エリア", value: "access" },
  { title: "お問い合わせ", value: "contact" },
];

type ServicePageValidationContext = {
  document?: { _id?: string };
  getClient: (options: { apiVersion: string }) => {
    withConfig: (options: { perspective: "raw" }) => {
      fetch: <T>(query: string, params: Record<string, unknown>) => Promise<T>;
    };
  };
};

const servicePageKindIsUnique = async (
  value: string | undefined,
  context: ServicePageValidationContext,
) => {
  const documentId = context.document?._id;
  if (!value || !documentId) {
    return true;
  }

  const publishedId = documentId.replace(/^drafts\./, "");
  const draftId = `drafts.${publishedId}`;
  const client = context
    .getClient({ apiVersion: "2025-01-01" })
    .withConfig({ perspective: "raw" });
  const duplicateId = await client.fetch<string | null>(
    `*[
      _type == "servicePage" &&
      kind == $kind &&
      _id != $publishedId &&
      _id != $draftId
    ][0]._id`,
    { kind: value, publishedId, draftId },
  );

  return duplicateId
    ? "このページ種別はすでに別の文書で使われています。"
    : true;
};

export const servicePageType = defineType({
  name: "servicePage",
  title: "サービス案内ページ",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      title: "ページ種別",
      type: "string",
      options: {
        list: servicePageKinds,
        layout: "radio",
      },
      validation: (rule) => rule.required().custom(servicePageKindIsUnique),
    }),
    defineField({
      name: "title",
      title: "ページタイトル",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "本文",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
          ],
        }),
        defineArrayMember({
          type: "image",
          fields: [
            defineField({
              name: "alt",
              title: "代替テキスト",
              type: "string",
              validation: (rule) => rule.required().max(160),
            }),
          ],
        }),
      ],
      validation: (rule) =>
        rule.required().custom((blocks) =>
          blocks?.some((block) => {
            const image = block as {
              _type?: string;
              asset?: { _ref?: string };
            };
            return image._type === "image" && !image.asset?._ref;
          })
            ? "本文内の画像には画像ファイルを選択してください。"
            : true,
        ),
    }),
    defineField({
      name: "heroImage",
      title: "メイン画像",
      type: "imageWithAlt",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO タイトル",
      type: "string",
      description:
        "検索結果やSNSに表示する完成したタイトルです。サイト名は自動追加しません。",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO 説明文",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "ogImage",
      title: "OGP 画像",
      type: "imageWithAlt",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "kind",
      media: "heroImage",
    },
  },
});
