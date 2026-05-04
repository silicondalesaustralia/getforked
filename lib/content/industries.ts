import { industrySeed } from "@/lib/content/industry-seed";

export function getPublishedIndustries() {
  return industrySeed.filter((industry) => industry.status === "published");
}

export function getIndustryBySlug(slug: string) {
  return industrySeed.find((industry) => industry.slug === slug);
}
