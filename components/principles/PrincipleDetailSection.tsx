import BackLink from "@/components/common/BackLink";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import { principleListPath } from "@/lib/paths";
import type { PageType, Principle } from "@/lib/data";

type PrincipleDetailSectionProps = {
  pageType: PageType;
  principle: Principle;
};

export default function PrincipleDetailSection({
  pageType,
  principle,
}: PrincipleDetailSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10">
      <BackLink href={principleListPath(pageType.id)} label="Back to principles" />
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Principle
        </p>
        <h2 className="text-2xl font-semibold text-white">
          <PeopleAwareText text={principle.title} />
        </h2>
      </header>
      <div className="space-y-3 text-sm text-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Definition
          </p>
          <p className="mt-1">
            <PeopleAwareText text={principle.definition} />
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Why it matters
          </p>
          <p className="mt-1">
            <PeopleAwareText text={principle.whyItMatters} />
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Example
          </p>
          <p className="mt-2">
            <PeopleAwareText text={principle.example} />
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
          Applies to <PeopleAwareText text={pageType.title} />
        </p>
      </div>
    </section>
  );
}
