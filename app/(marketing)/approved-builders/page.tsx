import { MarketingPage } from "@/components/marketplace/marketing-page";

export default function ApprovedBuildersPage() {
  return (
    <MarketingPage
      eyebrow="Approved builders"
      title="Every builder is reviewed before project invitations."
      description="Approved builders are verified for communication, AI workflow capability, tool fit, and delivery standards before they enter matching."
      points={["What approved means", "Skill verification", "Tool and category badges", "Communication standards", "QA and handover expectations", "Suspension and removal standards"]}
      ctaHref="/builder/apply"
      ctaLabel="Apply as a Builder"
    />
  );
}
