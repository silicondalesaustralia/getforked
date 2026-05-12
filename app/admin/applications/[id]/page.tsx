import { AdminSection } from "@/components/admin/admin-section";

type AdminApplicationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminApplicationPage({ params }: AdminApplicationPageProps) {
  const { id } = await params;
  return (
    <AdminSection
      title={`Builder Application: ${id}`}
      description="Review builder profile, samples, skills, tools, approval badges, and visibility controls."
      items={["Approve builder", "Reject application", "Assign badges", "Set visibility", "Record QA note", "Suspend profile"]}
    />
  );
}
