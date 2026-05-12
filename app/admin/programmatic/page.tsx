import { AdminSection } from "@/components/admin/admin-section";
import { marketplaceSettings } from "@/lib/marketplace/settings";

export default function AdminProgrammaticPage() {
  return (
    <AdminSection
      title="Programmatic SEO Foundation"
      description={`Prepare Phase 2 publishing. CSV imports enabled: ${marketplaceSettings.programmaticSeo.csvImportsEnabled}.`}
      items={["Page silos", "Draft pages", "CSV batches", "Publish status", "Internal linking prep", "Future sitemap controls"]}
    />
  );
}
