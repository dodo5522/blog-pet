import { defineField, defineType } from "sanity";
import { getGoogleMapsEmbedUrl } from "../../../src/lib/content/googleMapsEmbed";

export const googleMapsEmbedType = defineType({
  name: "googleMapsEmbed",
  title: "Google Maps 地図",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "Google Maps の埋め込みURL",
      type: "url",
      description:
        "Google Maps の共有メニューで「地図を埋め込む」を選び、iframeタグではなくsrcのURLを貼り付けてください。",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            getGoogleMapsEmbedUrl(value)
              ? true
              : "https://www.google.com/maps/embed?pb=... 形式のGoogle Maps埋め込みURLを入力してください。",
          ),
    }),
    defineField({
      name: "title",
      title: "地図のタイトル（任意）",
      type: "string",
      description:
        "地図の内容が分かる短いタイトルです。未入力時は「対応エリアの地図」と表示します。",
      validation: (rule) => rule.max(120),
    }),
  ],
  preview: {
    select: {
      title: "title",
      url: "url",
    },
    prepare({ title, url }) {
      return {
        title: title || "Google Maps 地図",
        subtitle: url,
      };
    },
  },
});
