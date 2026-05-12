import { MarketingPage } from "@/components/marketplace/marketing-page";

export default function PricingPage() {
  return (
    <MarketingPage
      eyebrow="Pricing"
      title="Projects are quoted after scope, not fixed-price gigs."
      description="Simple automations can start lower, while dashboard platforms and CRM replacements require deeper scoping. Buyer protection fee and builder commission are applied transparently."
      points={["Complexity-based quoting", "Common pricing factors", "Buyer service fee model", "Builder commission model", "Managed build option", "Support and maintenance options"]}
    />
  );
}
