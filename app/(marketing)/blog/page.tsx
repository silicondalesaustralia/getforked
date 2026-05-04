import Link from "next/link";

const posts = [
  {
    slug: "why-owning-your-stack-matters",
    title: "Why Owning Your Stack Matters",
    excerpt: "The hidden cost of rented software is not just price, it is control.",
  },
];

export default function BlogPage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Blog</h1>
      <div className="mt-6 grid gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-xl border border-zinc-800 p-5">
            <h2 className="font-semibold">{post.title}</h2>
            <p className="mt-2 text-zinc-300">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
