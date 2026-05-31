import Link from "next/link";

import BackLink from "@/components/common/BackLink";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import { homePath, vocabDetailPath } from "@/lib/paths";
import type { PageType, TermWithBucket, VocabularyBucket } from "@/lib/data";

type VocabularyListSectionProps = {
  pageType: PageType;
  bucket?: VocabularyBucket;
  terms: TermWithBucket[];
};

export default function VocabularyListSection({
  pageType,
  bucket,
  terms,
}: VocabularyListSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-inner shadow-black/40">
      <BackLink href={homePath} label="Back home" />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Vocabulary
        </p>
        <h2 className="text-2xl font-semibold text-white">
          <PeopleAwareText text={bucket?.title ?? "The words you need"} />
        </h2>
        <p className="text-sm text-slate-300">
          {bucket?.description ? (
            <PeopleAwareText text={bucket.description} />
          ) : (
            <>
              Everything here supports your <PeopleAwareText text={pageType.title} /> work.
            </>
          )}
        </p>
      </header>

      <div className="space-y-3">
        {terms.map((term) => (
          <Link
            key={term.id}
            href={vocabDetailPath(pageType.id, term.id)}
            className="block w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900"
          >
            <p className="text-base font-semibold text-white">
              <PeopleAwareText text={term.title} />
            </p>
            <p className="mt-1 text-sm text-slate-300">
              <PeopleAwareText text={term.shortDescription} />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
