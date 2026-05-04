import type { Industry } from "@/types/industry";
import { mortgageBrokers } from "@/lib/content/launch-industries/mortgage-brokers";
import { plumbing } from "@/lib/content/launch-industries/plumbing";
import { realEstate } from "@/lib/content/launch-industries/real-estate";

export const industrySeed: Industry[] = [
  plumbing,
  mortgageBrokers,
  realEstate,
  {
    slug: "physiotherapy",
    name: "Physiotherapy",
    saasTools: ["Cliniko", "Jane App"],
    painPoints: [
      { title: "Per-practitioner billing", body: "Subscription costs scale with every provider you add." },
      { title: "Workflow friction", body: "Generic clinic tools rarely match how your team operates." },
      { title: "Data export pain", body: "Your patient and booking data should be easy to move." },
    ],
    monthlyCost: 700,
    status: "ready",
    metaDescription: "Custom clinic software without per-practitioner subscription pricing.",
  },
  {
    slug: "cafes",
    name: "Cafés",
    saasTools: ["Square", "Lightspeed"],
    painPoints: [
      { title: "Transaction fees", body: "Payment and POS costs quietly compound every month." },
      { title: "POS lock-in", body: "Your menu, customer, and order data stay trapped." },
      { title: "Limited ownership of data", body: "You should control the systems that run the counter." },
    ],
    monthlyCost: 800,
    status: "draft",
    metaDescription: "Own your café ordering and POS stack with custom software.",
  },
];
