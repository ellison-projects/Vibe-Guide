import BackLink from "@/components/common/BackLink";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import { vocabListPath } from "@/lib/paths";
import type { TermWithBucket } from "@/lib/data";

type VocabularyDetailSectionProps = {
  pageTypeId: string;
  term: TermWithBucket;
};

export default function VocabularyDetailSection({
  pageTypeId,
  term,
}: VocabularyDetailSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10">
      <BackLink href={vocabListPath(pageTypeId)} label="Back to vocabulary" />
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Term definition
        </p>
        <h2 className="text-2xl font-semibold text-white">
          <PeopleAwareText text={term.title} />
        </h2>
      </header>
      <p className="text-base text-slate-200">
        <PeopleAwareText text={term.definition} />
      </p>
      {term.examples && term.examples.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Example
          </p>
          <p className="mt-2 text-sm text-slate-100">
            <PeopleAwareText text={term.examples[0]} />
          </p>
        </div>
      )}
    </section>
  );
}
