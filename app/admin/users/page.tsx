import { AdminSection } from "@/components/admin/admin-section";

export default function AdminUsersPage() {
  return (
    <AdminSection
      title="Users"
      description="Manage buyer, builder, admin, and super admin users with role-aware operational access."
      items={["Buyer users", "Builder users", "Admin users", "Role review", "Memberships", "Audit events"]}
    />
  );
}
