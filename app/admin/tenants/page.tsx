import { AdminSection } from "@/components/admin/admin-section";

export default function AdminTenantsPage() {
  return (
    <AdminSection
      title="Tenants"
      description="Manage buyer orgs, builder orgs, internal GetForked orgs, and tenant memberships."
      items={["Buyer orgs", "Builder orgs", "Internal org", "Owners", "Invites", "Removed memberships"]}
    />
  );
}
