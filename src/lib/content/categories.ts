import type { PostSummary } from "@/lib/content/types";

export function postMatchesCategorySlug(
  post: Pick<PostSummary, "categories">,
  slug: string,
): boolean {
  return post.categories.some((category) => category.slug === slug);
}
