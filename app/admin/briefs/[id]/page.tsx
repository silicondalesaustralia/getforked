import { AdminSection } from "@/components/admin/admin-section";

type AdminBriefPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBriefPage({ params }: AdminBriefPageProps) {
  const { id } = await params;
  return (
    <AdminSection
      title={`Brief Review: ${id}`}
      description="Review structured brief details, tags, complexity, private attachments, and lifecycle status."
      items={["Set status", "Add tags", "Estimate complexity", "Request more info", "Convert to project", "Add internal note"]}
    />
  );
}
