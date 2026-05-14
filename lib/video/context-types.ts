export type LandingPageSourceType = "zapier" | "ai_automation" | "static" | "industry";

export type LandingPageVideoContext = {
  sourceId: string;
  sourceType: LandingPageSourceType;
  pageUrl: string;
  pageTitle: string;
  h1: string;
  heroSummary: string;
  audience: string;
  painPoints: string[];
  benefits: string[];
  proofPoints: string[];
  cta: {
    label: string;
    url: string;
  };
  brand: {
    name: "GetForked";
    siteUrl: string;
    colors: {
      background: string;
      foreground: string;
      accent: string;
    };
  };
  compliance: {
    bannedClaims: string[];
    requiredPhrases: string[];
  };
};

export type LandingPageVideoCandidate = {
  sourceId: string;
  sourceType: LandingPageSourceType;
  title: string;
  pageUrl: string;
  priority: number;
};
