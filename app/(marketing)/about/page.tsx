import { MarketingPage } from "@/components/marketplace/marketing-page";

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About"
      title="GetForked bridges SaaS-heavy businesses and AI-native builders."
      description="Our mission is to reduce SaaS/tool bloat by matching businesses with vetted developers who can replace recurring subscriptions with tools the business actually owns."
      points={["Why now", "Mission and positioning", "AI-native builder network", "Managed matching process", "Business outcomes over feature bloat", "Long-term platform roadmap"]}
    />
  );
}
