import { defineField, defineType } from "sanity";

export const staffType = defineType({
  name: "staff",
  title: "スタッフ",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "名前",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "name",
      },
    }),
    defineField({
      name: "role",
      title: "役割",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "紹介文",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "avatar",
      title: "プロフィール画像",
      type: "imageWithAlt",
    }),
    defineField({
      name: "links",
      title: "SNS・関連リンク",
      type: "array",
      of: [{ type: "socialLink" }],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "avatar",
    },
  },
});
