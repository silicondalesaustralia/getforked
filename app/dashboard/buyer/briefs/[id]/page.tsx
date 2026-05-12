type BuyerBriefDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BuyerBriefDetailsPage({ params }: BuyerBriefDetailsPageProps) {
  const { id } = await params;
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Brief {id}</h1>
      <p className="mt-2 text-zinc-300">Status timeline, summary details, and follow-up requests appear here.</p>
    </div>
  );
}
