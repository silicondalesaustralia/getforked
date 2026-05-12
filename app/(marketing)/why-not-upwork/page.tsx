import { MarketingPage } from "@/components/marketplace/marketing-page";

export default function WhyNotUpworkPage() {
  return (
    <MarketingPage
      eyebrow="Managed matching"
      title="Why not Upwork or Fiverr for SaaS replacement work?"
      description="Open bidding and gig marketplaces often start with unclear scope. GetForked reviews each brief, matches approved builders, and keeps project and milestone records structured."
      points={["No bid spam", "Approved builders only", "Structured briefs", "Milestone-ready projects", "Maintenance-ready delivery", "Private business context"]}
    />
  );
}
