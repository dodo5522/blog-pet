import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "カテゴリー",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "カテゴリー名",
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "説明",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
    },
  },
});
