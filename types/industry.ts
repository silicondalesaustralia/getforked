export type IndustryStatus = "draft" | "ready" | "published";

export type IndustryPainPoint = {
  title: string;
  body: string;
};

export type IndustryReplacementRow = {
  current: string;
  replacement: string;
};

export type RegionalStackExample = {
  country: string;
  examples: string[];
};

export type CalculatorDefaults = {
  tools: number;
  averageMonthlyCost: number;
  multiplier: number;
  breakevenMessage: string;
};

export type LeadFormSelectField = {
  name: string;
  label: string;
  options: string[];
};

export type LeadFormConfig = {
  companyLabel: string;
  teamSizeField?: LeadFormSelectField;
  extraFields?: LeadFormSelectField[];
  softwareOptions: string[];
  spendOptions: string[];
};

export type IndustryVideo = {
  embedUrl?: string;
  hookScript: string;
};

export type Industry = {
  slug: string;
  name: string;
  saasTools: string[];
  painPoints: IndustryPainPoint[];
  monthlyCost: number;
  status: IndustryStatus;
  pageTitle?: string;
  metaDescription: string;
  ogImageText?: string;
  heroHeadline?: string;
  heroSubtitle?: string;
  supportingText?: string;
  replacementRows?: IndustryReplacementRow[];
  regionalStackExamples?: RegionalStackExample[];
  calculatorDefaults?: CalculatorDefaults;
  leadForm?: LeadFormConfig;
  video?: IndustryVideo;
  seoKeywords?: string[];
};
