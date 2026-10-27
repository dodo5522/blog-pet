import type { SanityImage } from "./content/types";

export function firstNonBlank(
  ...values: Array<string | undefined>
): string | undefined {
  return values.map((value) => value?.trim()).find((value) => Boolean(value));
}

export function selectSeoImage(
  ...images: Array<SanityImage | undefined>
): string | undefined {
  return firstNonBlank(...images.map((image) => image?.asset?.url));
}
