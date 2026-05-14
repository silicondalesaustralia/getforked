import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnrichedStaticPage } from "@/components/marketplace/enriched-static-page";
import { getStaticPageByPath } from "@/lib/content/static-pages";
import { buildStaticPageMetadata } from "@/lib/seo/static-page-seo";
import { generateStaticPageSchema } from "@/lib/schema";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getStaticPageByPath(`/blog/${slug}/`);
  if (!post) return {};

  return buildStaticPageMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getStaticPageByPath(`/blog/${slug}/`);
  if (!post) {
    notFound();
  }
  const schema = generateStaticPageSchema({
    path: post.path,
    title: post.seoTitle,
    headline: post.h1,
    description: post.metaDescription,
    about: post.schemaAbout,
    mentions: post.schemaMentions,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EnrichedStaticPage page={post} />
    </>
  );
}
