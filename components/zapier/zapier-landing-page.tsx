import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { MarketContextSection } from "@/components/programmatic/market-context-section";
import { ZapierBeforeAfterWorkflow } from "@/components/zapier/zapier-before-after-workflow";
import { ZapierBriefCard } from "@/components/zapier/zapier-brief-card";
import { ZapierBuilderMatching } from "@/components/zapier/zapier-builder-matching";
import { ZapierCostComparison } from "@/components/zapier/zapier-cost-comparison";
import { ZapierFinalCTA } from "@/components/zapier/zapier-final-cta";
import { ZapierHero } from "@/components/zapier/zapier-hero";
import { ZapierProblemSection } from "@/components/zapier/zapier-problem-section";
import { ZapierRelatedPages } from "@/components/zapier/zapier-related-pages";
import { ZapierReplacementSection } from "@/components/zapier/zapier-replacement-section";
import { ZapierSEOContent } from "@/components/zapier/zapier-seo-content";
import { ZapierTrustBar } from "@/components/zapier/zapier-trust-bar";
import { useZapierLayoutTest } from "@/components/zapier/zapier-layout-test";

type Props = {
  page: ProgrammaticPage;
  relatedPages: ProgrammaticPage[];
};

export function ZapierLandingPage({ page, relatedPages }: Props) {
  const layoutTest = useZapierLayoutTest(page);

  return (
    <div className="min-h-screen bg-[#050708] text-[#F4F7F5]">
      <section className={`container ${layoutTest ? "pb-12 pt-10 md:pt-14" : "pb-16 pt-16 md:pt-24"}`}>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.8fr)] lg:gap-14">
          <ZapierHero page={page} />
          <ZapierBriefCard page={page} />
        </div>
      </section>
      <ZapierTrustBar />
      <section className="container py-12">
        <MarketContextSection focus="zapier" />
      </section>
      <ZapierProblemSection page={page} />
      <ZapierReplacementSection page={page} />
      <ZapierBeforeAfterWorkflow page={page} />
      <ZapierCostComparison page={page} />
      <ZapierBuilderMatching page={page} />
      <ZapierSEOContent page={page} />
      <ZapierRelatedPages page={page} relatedPages={relatedPages} />
      <ZapierFinalCTA page={page} />
    </div>
  );
}
