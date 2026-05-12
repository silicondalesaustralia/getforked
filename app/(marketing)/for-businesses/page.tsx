import { MarketingPage } from "@/components/marketplace/marketing-page";

export default function ForBusinessesPage() {
  return (
    <MarketingPage
      eyebrow="For businesses"
      title="Stop managing freelancer chaos and start with a scoped brief."
      description="Explain your workflow and pain points once, then get matched with approved builders who can actually ship your replacement system."
      points={["Use cases we support", "What can be automated", "What affects project cost", "Why we start with a brief", "Private-by-default project data", "Managed matching by fit"]}
    />
  );
}
