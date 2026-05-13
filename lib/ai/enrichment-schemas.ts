import { z } from "zod";

const text = (min: number, max: number) => z.string().min(min).max(max);

export const EnrichedPageContentSchema = z.object({
  seo_title: text(20, 80),
  h1: text(20, 100),
  meta_description: text(80, 180),
  hero_intro: z.array(text(40, 500)).min(2).max(3),
  problem_heading: text(10, 120),
  problem_summary: text(80, 700),
  failure_modes: z.array(text(10, 120)).min(4).max(6),
  replacement_heading: text(10, 120),
  replacement_summary: text(80, 700),
  replacement_cards: z
    .array(z.object({ title: text(4, 80), description: text(40, 300) }))
    .min(4)
    .max(6),
  before_flow: text(40, 300),
  after_flow: text(40, 300),
  cost_context: text(80, 700),
  when_zapier_is_still_right: text(80, 700).optional(),
  human_in_the_loop: text(80, 700).optional(),
  builder_matching_summary: text(80, 700),
  builder_skill_tags: z.array(text(2, 60)).min(3).max(8),
  seo_body_sections: z
    .array(
      z.object({
        h2: text(10, 120),
        paragraphs: z.array(text(60, 800)).min(1).max(3),
        h3_sections: z.array(z.object({ h3: text(5, 120), paragraph: text(60, 700) })).max(4),
      }),
    )
    .min(3)
    .max(6),
  faq: z.array(z.object({ question: text(20, 140), answer: text(60, 500) })).min(2).max(5),
  schema_about: z.array(text(3, 80)).min(3).max(8),
  schema_mentions: z.array(text(3, 80)).min(3).max(10),
  related_card_overrides: z.array(z.object({ url: z.string(), title: text(5, 100), description: text(40, 240) })).optional(),
});

export const EnrichmentQaSchema = z.object({
  approved: z.boolean(),
  scores: z.object({
    tool_specificity: z.number().min(0).max(10),
    workflow_specificity: z.number().min(0).max(10),
    difference_from_template: z.number().min(0).max(10),
    commercial_clarity: z.number().min(0).max(10),
    seo_alignment: z.number().min(0).max(10),
    repetition_risk: z.number().min(0).max(10),
  }),
  issues: z.array(z.string()),
  required_revisions: z.array(z.string()),
});

export type EnrichedPageContent = z.infer<typeof EnrichedPageContentSchema>;
export type EnrichmentQa = z.infer<typeof EnrichmentQaSchema>;
