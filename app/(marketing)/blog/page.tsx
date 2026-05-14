import Link from "next/link";
import { EnrichedStaticPage } from "@/components/marketplace/enriched-static-page";
import { getStaticPage, getStaticPages } from "@/lib/content/static-pages";
import { buildStaticPageMetadata } from "@/lib/seo/static-page-seo";
import { generateStaticPageSchema } from "@/lib/schema";

const staticPage = getStaticPage("blog");
const posts = getStaticPages().filter((page) => page.pageRole === "blog_post");

export const metadata = buildStaticPageMetadata(staticPage);

export default function BlogPage() {
  const schema = generateStaticPageSchema({
    path: staticPage.path,
    title: staticPage.seoTitle,
    headline: staticPage.h1,
    description: staticPage.metaDescription,
    about: staticPage.schemaAbout,
    mentions: staticPage.schemaMentions,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EnrichedStaticPage page={staticPage}>
        <div className="mt-6 grid gap-4">
          {posts.map((post) => (
            <Link key={post.id} href={post.path} className="rounded-xl border border-zinc-800 p-5">
              <h2 className="font-semibold">{post.h1}</h2>
              <p className="mt-2 text-zinc-300">{post.metaDescription}</p>
            </Link>
          ))}
        </div>
      </EnrichedStaticPage>
    </>
  );
}
