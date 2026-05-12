import { MarketingPage } from "@/components/marketplace/marketing-page";

export default function HowItWorksPage() {
  return (
    <MarketingPage
      eyebrow="Managed process"
      title="From brief to launch in six guided steps."
      description="Submit a structured brief, then our team reviews, scopes, matches, and manages delivery through milestone-ready project tracking."
      points={["Submit a brief", "Get reviewed by GetForked", "Builder matching", "Scope and quote", "Milestone-based delivery", "Handover and support"]}
    />
  );
}
