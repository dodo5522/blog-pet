import { defineArrayMember, defineField, defineType } from "sanity";

export const tableType = defineType({
  name: "table",
  title: "表",
  type: "object",
  fields: [
    defineField({
      name: "headerRows",
      title: "ヘッダー行数",
      type: "number",
      initialValue: 1,
      hidden: true,
    }),
    defineField({
      name: "rows",
      title: "行",
      type: "array",
      of: [
        defineArrayMember({
          name: "row",
          title: "行",
          type: "object",
          fields: [
            defineField({
              name: "cells",
              title: "セル",
              type: "array",
              of: [
                defineArrayMember({
                  name: "cell",
                  title: "セル",
                  type: "object",
                  fields: [
                    defineField({
                      name: "value",
                      title: "内容",
                      type: "array",
                      of: [
                        defineArrayMember({
                          type: "block",
                          styles: [{ title: "Normal", value: "normal" }],
                          lists: [],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});
