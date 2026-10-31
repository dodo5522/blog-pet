import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "your-project-id";
const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.SANITY_DATASET ||
  "production";

export default defineConfig({
  name: "default",
  title: "blog-pet Studio",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  form: {
    components: {
      portableText: {
        plugins: (props) =>
          props.renderDefault({
            ...props,
            plugins: {
              ...props.plugins,
              table: { enabled: true },
            },
          }),
      },
    },
  },
  schema: {
    types: schemaTypes,
  },
});
