import type { SanityImage } from "./types";

export function selectHomeImage(image?: SanityImage | null): {
  src: string;
  alt: string;
} {
  const src = image?.asset?.url?.trim();
  if (src) return { src, alt: image?.alt?.trim() || "" };
  return {
    src: "/images/cat-window-light.webp",
    alt: "日差しの入る部屋でくつろぐ猫のイメージ",
  };
}
