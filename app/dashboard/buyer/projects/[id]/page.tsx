type BuyerProjectDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuyerProjectDetailsPage({ params }: BuyerProjectDetailsPageProps) {
  const { id } = await params;
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Project {id}</h1>
      <p className="mt-2 text-zinc-300">Project scope, milestones, and delivery updates are shown here.</p>
    </div>
  );
}
