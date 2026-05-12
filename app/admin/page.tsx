import { AdminSection } from "@/components/admin/admin-section";

export default function AdminHomePage() {
  return (
    <AdminSection
      title="Operations Overview"
      description="Review marketplace queues, builder supply, matching activity, projects, and admin settings."
      items={["Briefs awaiting review", "Builder applications", "Matching queue", "Active projects", "Users and tenants", "Audit and notes"]}
    />
  );
}
