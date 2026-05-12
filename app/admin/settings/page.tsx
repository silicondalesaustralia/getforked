import { AdminSection } from "@/components/admin/admin-section";
import { marketplaceSettings } from "@/lib/marketplace/settings";

export default function AdminSettingsPage() {
  return (
    <AdminSection
      title="Marketplace Settings"
      description={marketplaceSettings.paymentLanguage}
      items={["Builder commission %", "Buyer service fee %", "Payment protection copy", "Notification routing", "Admin access", "Destructive action guardrails"]}
    />
  );
}
