type BuilderProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BuilderProfilePage({ params }: BuilderProfilePageProps) {
  const { slug } = await params;
  return (
    <div className="container max-w-3xl py-14">
      <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Builder profile</p>
      <h1 className="mt-3 text-4xl font-bold">{slug}</h1>
      <p className="mt-4 text-zinc-300">
        Public builder profiles are scaffolded for Phase 1 and can be hidden, non-indexed, or enabled by admins.
      </p>
    </div>
  );
}
