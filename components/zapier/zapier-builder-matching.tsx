import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { textList } from "@/components/zapier/zapier-utils";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierBuilderMatching({ page }: Props) {
  const badges = textList(page.requiredBuilderBadges);

  return (
    <section className="container py-16">
      <div className="rounded-[22px] border border-[#243034] bg-[#0B1012] p-6 md:p-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#18E38A]">Builder matching</p>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          How GetForked matches the right approved builder
        </h2>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-[#B8C2BE]">
          GetForked does not send your project into an open bidding feed. Your brief is matched against approved
          builders based on tool experience, integration type, availability, project size, and delivery history.
        </p>
        <p className="mt-4 max-w-4xl leading-7 text-[#B8C2BE]">{page.builderMatchFactors}</p>
        {badges.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full border border-[rgba(24,227,138,0.28)] px-3 py-1 text-sm">
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
