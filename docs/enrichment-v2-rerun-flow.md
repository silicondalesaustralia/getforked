# Enrichment V2 Rerun Flow

## Goal

Re-enrich the 136 programmatic pages without the old template overwrite layer. V2 lets the LLM generate the unique sections, injects research and sibling pages into the prompt, validates specificity afterward, and flags weak pages for manual enrichment instead of filling them with fallback templates.

## What Changed

- `enforceResearchAnchors` no longer overwrites generated content.
- Research now includes pair-specific failures, triggers, constraints, scenarios, and data-flow notes.
- AI automation pages now get use-case framing so synonyms like software, tools, solutions, and platform separate by intent.
- Prompts include sibling page content as negative examples.
- QA now checks research anchors, known fallback phrases, skeleton similarity, and embedding similarity when `OPENAI_API_KEY` is available.
- Non-dry runs create a timestamped backup of the generated page store before writing.

## Preflight

1. Confirm `.env.local` has `OPENAI_API_KEY`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Run a similarity baseline:

```bash
npm run audit:similarity -- --silo=ai-automation
npm run audit:similarity -- --silo=zapier
```

## Batch 1: AI Automation Pages

Dry run the highest-risk synonym pages first:

```bash
npm run enrich:pages -- --silo=ai-automation --limit=20 --dry-run=true
```

Review `reports/enrichment-preview/*.md` and `*.json`. If the output is specific, structurally different, and not marked `needs_manual_enrichment`, write the batch:

```bash
npm run enrich:pages -- --silo=ai-automation --limit=20 --dry-run=false
```

## Batch 2: High-Similarity Zapier Pages

Run the audit, then re-enrich the worst matching pages one at a time or in small groups:

```bash
npm run audit:similarity -- --silo=zapier
npm run enrich:pages -- --silo=zapier --page=airtable-sheets --dry-run=true
```

When previews pass, rerun the same command with `--dry-run=false`.

## Batch 3: Remaining Zapier Pages

Process in groups of 10-15:

```bash
npm run enrich:pages -- --silo=zapier --limit=15 --offset=0 --dry-run=true
npm run enrich:pages -- --silo=zapier --limit=15 --offset=0 --dry-run=false
npm run enrich:pages -- --silo=zapier --limit=15 --offset=15 --dry-run=true
npm run enrich:pages -- --silo=zapier --limit=15 --offset=15 --dry-run=false
```

## Final Validation

After each written batch:

```bash
npm run audit:similarity -- --silo=ai-automation
npm run audit:similarity -- --silo=zapier
npm run typecheck
npm run build
```

Pages marked `needs_manual_enrichment` should not be force-published. Improve their research inputs or review them manually, then rerun with `--page=<slug>`.
