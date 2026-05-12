import { AdminSection } from "@/components/admin/admin-section";

export default function AdminProjectsPage() {
  return (
    <AdminSection
      title="Projects and Milestones"
      description="Manage matched projects, milestone status, manual payment readiness, and project notes."
      items={["Project lifecycle", "Milestone list", "Manual payment status", "Buyer visibility", "Builder status updates", "Internal notes"]}
    />
  );
}
