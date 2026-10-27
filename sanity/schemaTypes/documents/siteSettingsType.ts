import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "siteTagline",
      title: "Site tagline",
      type: "string",
      description:
        "Shown as the home page heading. When empty, the site uses its default tagline.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "siteUrl",
      title: "Site URL",
      type: "url",
      description:
        "公開URLの記録です。変更時は配信のPUBLIC_SITE_URLも同じ値に合わせてください。正規URLの生成にはPUBLIC_SITE_URLを使用します。",
      validation: (rule) =>
        rule
          .required()
          .uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "defaultSeoTitle",
      title: "Default SEO title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "defaultSeoDescription",
      title: "Default SEO description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default OGP image",
      type: "imageWithAlt",
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [{ type: "socialLink" }],
    }),
    defineField({
      name: "contactUrl",
      title: "問い合わせ先 URL",
      type: "url",
      description: "問い合わせフォームなどの外部 URL を設定します。",
      validation: (rule) =>
        rule.uri({ allowRelative: false, scheme: ["http", "https"] }),
    }),
    defineField({
      name: "contactLabel",
      title: "問い合わせリンクの表示名",
      type: "string",
      description: "例: お問い合わせフォーム",
      validation: (rule) => rule.max(60),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Site settings",
      };
    },
  },
});
