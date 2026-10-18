export interface SanityImageAsset {
  url: string;
}

export interface SanityImage {
  alt?: string;
  asset?: SanityImageAsset;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Staff {
  _id: string;
  name: string;
  slug?: string;
  role?: string;
  bio?: string;
  avatar?: SanityImage;
  links?: SocialLink[];
}

export type ServicePageKind = "usage" | "price" | "access" | "contact";

export interface ServicePage {
  _id: string;
  kind: ServicePageKind;
  title: string;
  body: PortableTextBlock[];
  heroImage?: SanityImage;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImage;
}

export interface PortableTextSpan {
  _key?: string;
  _type: "span";
  text: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _key?: string;
  _type: string;
  style?: string;
  children?: PortableTextSpan[];
  markDefs?: Array<Record<string, unknown>>;
  code?: string;
  language?: string;
  filename?: string;
  alt?: string;
  asset?: SanityImageAsset;
}

export interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  coverImage?: SanityImage;
  categories: Category[];
  author?: Staff;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImage;
  body?: PortableTextBlock[];
}

export interface Post extends PostSummary {
  body: PortableTextBlock[];
}

export interface SiteSettings {
  siteTitle: string;
  siteTagline: string;
  siteUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage?: SanityImage;
  socialLinks: SocialLink[];
  contactUrl?: string;
  contactLabel?: string;
}
