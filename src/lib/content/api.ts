import {
  fallbackPosts,
  fallbackCategories,
  fallbackServicePages,
  fallbackSiteSettings,
  fallbackStaff,
} from "@/lib/content/fallback";
import {
  POST_BY_SLUG_QUERY,
  POSTS_QUERY,
  CATEGORIES_QUERY,
  SERVICE_PAGE_BY_KIND_QUERY,
  SITE_SETTINGS_QUERY,
  STAFF_QUERY,
} from "@/lib/content/queries";
import {
  normalizeSiteSettings,
  type SanitySiteSettings,
} from "@/lib/content/siteSettings";
import { postMatchesCategorySlug } from "@/lib/content/categories";
import {
  seoFixtureCategories,
  seoFixturePosts,
  seoFixtureServicePages,
  seoFixtureSiteSettings,
} from "@/lib/content/seoFixture";
import type {
  Category,
  Post,
  PostSummary,
  ServicePage,
  ServicePageKind,
  SiteSettings,
  Staff,
} from "@/lib/content/types";
import { sanityFallbackMode } from "@/lib/env";
import { sanityClient } from "@/lib/sanity/client";

type SanityFetchResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
    };

const fetchCache = new Map<string, Promise<SanityFetchResult<unknown>>>();
const fallbackModes = new Set(["auto", "always", "never"]);
const useSeoFixture =
  import.meta.env.MODE === "seo-test" && sanityFallbackMode === "always";
const localSiteSettings = useSeoFixture
  ? seoFixtureSiteSettings
  : fallbackSiteSettings;
const localPosts = useSeoFixture ? seoFixturePosts : fallbackPosts;
const localCategories = useSeoFixture
  ? seoFixtureCategories
  : fallbackCategories;
const localServicePages = useSeoFixture
  ? seoFixtureServicePages
  : fallbackServicePages;

function normalizedFallbackMode(): "auto" | "always" | "never" {
  return fallbackModes.has(sanityFallbackMode)
    ? (sanityFallbackMode as "auto" | "always" | "never")
    : "auto";
}

function canUseFallback(reason: "not-configured" | "fetch-error"): boolean {
  const mode = normalizedFallbackMode();
  if (mode === "always") {
    return true;
  }
  if (mode === "never") {
    return false;
  }

  return reason === "not-configured";
}

async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<SanityFetchResult<T>> {
  if (normalizedFallbackMode() === "always") {
    return { ok: false };
  }

  if (!sanityClient) {
    if (canUseFallback("not-configured")) {
      return { ok: false };
    }

    throw new Error(
      "Sanity is not configured and fallback content is disabled.",
    );
  }

  const cacheKey = JSON.stringify([query, params]);
  const cached = fetchCache.get(cacheKey);
  if (cached) {
    return cached as Promise<SanityFetchResult<T>>;
  }

  const request = sanityClient
    .fetch<T>(query, params)
    .then(
      (data): SanityFetchResult<T> => ({
        ok: true,
        data,
      }),
    )
    .catch((error): SanityFetchResult<T> => {
      if (!canUseFallback("fetch-error")) {
        throw new Error(
          "Failed to fetch content from Sanity and fallback content is disabled.",
          { cause: error },
        );
      }

      console.warn(
        "Failed to fetch content from Sanity. Using fallback content because SANITY_FALLBACK_MODE allows it.",
        error,
      );
      return { ok: false };
    });

  fetchCache.set(cacheKey, request as Promise<SanityFetchResult<unknown>>);
  return request;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const result = await fetchSanity<SanitySiteSettings | null>(
    SITE_SETTINGS_QUERY,
  );
  if (result.ok) {
    if (result.data) return normalizeSiteSettings(result.data);
    if (normalizedFallbackMode() === "never") {
      throw new Error(
        "Sanity site settings are missing and fallback content is disabled.",
      );
    }
  }
  return localSiteSettings;
}

export async function getPublishedPosts(): Promise<PostSummary[]> {
  const result = await fetchSanity<PostSummary[]>(POSTS_QUERY);
  return result.ok ? result.data : localPosts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const result = await fetchSanity<Post | null>(POST_BY_SLUG_QUERY, { slug });
  if (result.ok) {
    return result.data;
  }

  return localPosts.find((entry) => entry.slug === slug) || null;
}

export async function getCategories(): Promise<Category[]> {
  const result = await fetchSanity<Category[]>(CATEGORIES_QUERY);
  return result.ok ? result.data : localCategories;
}

export async function getPostsByCategorySlug(
  slug: string,
): Promise<PostSummary[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => postMatchesCategorySlug(post, slug));
}

export async function getStaff(): Promise<Staff[]> {
  const result = await fetchSanity<Staff[]>(STAFF_QUERY);
  return result.ok ? result.data : fallbackStaff;
}

export async function getServicePage(
  kind: ServicePageKind,
): Promise<ServicePage | null> {
  const result = await fetchSanity<ServicePage | null>(
    SERVICE_PAGE_BY_KIND_QUERY,
    { kind },
  );
  return result.ok
    ? result.data
    : (localServicePages.find((page) => page.kind === kind) ?? null);
}
