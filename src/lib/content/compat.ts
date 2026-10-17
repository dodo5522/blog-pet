import type { PostSummary, Tag } from "@/lib/content/types";

export function normalizePostSummary<T extends PostSummary>(post: T): T {
  const categories = (post.categories ?? []).filter(Boolean);
  const legacyTags = (
    (post.legacyTags ?? post.tags ?? []) as Array<Tag | null>
  ).filter((tag): tag is Tag => Boolean(tag));

  return {
    ...post,
    categories,
    legacyTags,
    tags: categories.length > 0 ? categories : legacyTags,
  };
}

export function postMatchesTagSlug(post: PostSummary, slug: string): boolean {
  return (
    post.tags.some((tag) => tag.slug === slug) ||
    post.legacyTags?.some((tag) => tag.slug === slug) === true
  );
}
