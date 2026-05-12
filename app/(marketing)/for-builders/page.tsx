import { MarketingPage } from "@/components/marketplace/marketing-page";

export default function ForBuildersPage() {
  return (
    <MarketingPage
      eyebrow="For builders"
      title="Build with AI and get matched to real projects."
      description="Join the approved builder network to receive scoped projects, fair pricing, and operational support without bid spam."
      points={["Why join GetForked", "No bid spam", "Receive matched projects", "Approved skill categories", "Expected standards", "How applications work"]}
      ctaHref="/builder/apply"
      ctaLabel="Apply as a Builder"
    />
  );
}
