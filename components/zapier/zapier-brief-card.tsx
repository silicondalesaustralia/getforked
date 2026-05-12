import Link from "next/link";
import type { ProgrammaticPage } from "@/lib/programmatic-pages";
import { buildBriefUrl } from "@/lib/brief-prefill";
import { toolLabel } from "@/components/zapier/zapier-utils";

type Props = {
  page: ProgrammaticPage;
};

export function ZapierBriefCard({ page }: Props) {
  return (
    <aside className="w-full max-w-[480px] rounded-[20px] border border-[rgba(24,227,138,0.16)] bg-gradient-to-b from-[#101719] to-[#0B1012] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] lg:sticky lg:top-24 lg:ml-auto">
      <h2 className="mb-2 text-xl font-semibold">Get your builder match</h2>
      <p className="mb-5 text-sm text-[#B8C2BE]">
        Tell us what you want to replace. We will route the brief to an approved builder with the right tool
        experience.
      </p>
      <div className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wide text-[#7E8A86]">Project type</label>
          <div className="mt-1 rounded-lg border border-[#243034] bg-[#050708] px-3 py-3 text-sm">
            {page.projectType || "Zapier replacement workflow"}
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-[#7E8A86]">Tools</label>
          <div className="mt-1 rounded-lg border border-[#243034] bg-[#050708] px-3 py-3 text-sm">
            {page.briefPrefillTools || toolLabel(page)}
          </div>
        </div>
        <Link
          href={buildBriefUrl(page)}
          className="block w-full rounded-[10px] bg-gradient-to-br from-[#18E38A] to-[#12C978] px-5 py-3 text-center font-bold text-[#02100A] shadow-[0_14px_36px_rgba(24,227,138,0.22)]"
        >
          Submit Your Brief
        </Link>
      </div>
      <p className="mt-4 text-xs text-[#7E8A86]">
        We scope the project before you commit. Larger builds can be manually reviewed by GetForked.
      </p>
    </aside>
  );
}
