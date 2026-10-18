import { DEFAULT_SITE_TAGLINE } from "@/lib/content/siteSettings";
import type {
  Category,
  Post,
  PortableTextBlock,
  ServicePage,
  ServicePageKind,
  SiteSettings,
  Staff,
} from "@/lib/content/types";
import { publicSiteUrl } from "@/lib/env";

export const fallbackSiteSettings: SiteSettings = {
  siteTitle: "ペットシッター",
  siteTagline: DEFAULT_SITE_TAGLINE,
  siteUrl: publicSiteUrl,
  defaultSeoTitle: "ペットシッターの活動報告とサービス案内",
  defaultSeoDescription:
    "ペットシッターの日々の活動報告と、ご利用方法・サービスのご案内です。",
  socialLinks: [],
};

export const fallbackCategories: Category[] = [
  {
    _id: "fallback-category-work",
    name: "お仕事",
    slug: "work",
    description: "日々のシッティングの活動報告",
  },
  {
    _id: "fallback-category-diary",
    name: "日記",
    slug: "diary",
    description: "ペットシッターの日常",
  },
  {
    _id: "fallback-category-news",
    name: "お知らせ",
    slug: "news",
    description: "サービスに関するお知らせ",
  },
];

export const fallbackStaff: Staff[] = [
  {
    _id: "fallback-staff-profile",
    name: "ペットシッター",
    role: "担当スタッフ",
    bio: "スタッフ紹介は、運営者の情報を Sanity Studio に登録すると表示されます。",
  },
];

function paragraph(text: string): PortableTextBlock {
  return {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text }],
  };
}

const servicePageCopy: Record<
  ServicePageKind,
  { title: string; paragraphs: string[] }
> = {
  usage: {
    title: "ご利用方法",
    paragraphs: [
      "お問い合わせからご利用までの流れをご案内します。",
      "対応内容や訪問日時は、事前の打ち合わせで確認します。",
    ],
  },
  price: {
    title: "料金",
    paragraphs: [
      "サービス内容や料金は、運営者が Sanity Studio に掲載した情報をご確認ください。",
      "このローカル表示用サンプルには、実際の料金や条件は含まれていません。",
    ],
  },
  access: {
    title: "対応エリア・アクセス",
    paragraphs: [
      "対応エリアは、運営者が Sanity Studio に掲載した情報をご確認ください。",
      "訪問サービスの詳細は事前にご相談ください.",
    ],
  },
  contact: {
    title: "お問い合わせ",
    paragraphs: [
      "お問い合わせ先は、運営者が Sanity Studio のサイト設定に登録したリンクをご確認ください。",
      "このローカル表示用サンプルには問い合わせリンクはありません。",
    ],
  },
};

export const fallbackServicePages: ServicePage[] = Object.entries(
  servicePageCopy,
).map(([kind, page]) => ({
  _id: `fallback-service-page-${kind}`,
  kind: kind as ServicePageKind,
  title: page.title,
  body: page.paragraphs.map(paragraph),
}));

export const fallbackPosts: Post[] = [
  {
    _id: "fallback-post-hello-pet-sitter",
    title: "はじめまして。ペットシッターの日々をお届けします",
    slug: "hello-pet-sitter",
    excerpt:
      "このブログでは、ペットシッターとして訪問した日の様子やサービスについてお伝えします。",
    publishedAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
    categories: fallbackCategories,
    seoTitle: "ペットシッターの日々について",
    seoDescription: "活動報告とサービス案内をお届けするブログです。",
    body: [
      paragraph(
        "この投稿は画面構成を確認するためのローカル用サンプルです。実在のお客様や動物についての情報は含みません。",
      ),
      paragraph(
        "ご利用方法や対応内容は、サイト内のサービス案内をご確認ください。",
      ),
    ],
  },
];
