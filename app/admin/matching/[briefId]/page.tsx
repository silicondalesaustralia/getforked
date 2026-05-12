import { AdminSection } from "@/components/admin/admin-section";

type MatchingPageProps = {
  params: Promise<{ briefId: string }>;
};

export default async function MatchingPage({ params }: MatchingPageProps) {
  const { briefId } = await params;
  return (
    <AdminSection
      title={`Matching Workspace: ${briefId}`}
      description="Invite one or more approved builders, track invitation history, and convert accepted matches into projects."
      items={["Builder directory", "Invite message", "Invitation history", "Accept/decline status", "Create project", "Audit timeline"]}
    />
  );
}
