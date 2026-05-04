import { notFound } from "next/navigation";

const postMap: Record<string, { title: string; body: string }> = {
  "why-owning-your-stack-matters": {
    title: "Why Owning Your Stack Matters",
    body: "Subscription software becomes expensive and fragile over time. Owning the code gives you control over cost, roadmap, and data.",
  },
};

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = postMap[slug];
  if (!post) {
    notFound();
  }

  return (
    <article className="container py-14">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="mt-4 max-w-3xl text-zinc-300">{post.body}</p>
    </article>
  );
}
