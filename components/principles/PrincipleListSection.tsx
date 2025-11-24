import Link from "next/link";

import BackLink from "@/components/common/BackLink";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import { homePath, principleDetailPath } from "@/lib/paths";
import type { PageType } from "@/lib/data";

type PrincipleListSectionProps = {
  pageType: PageType;
};

export default function PrincipleListSection({ pageType }: PrincipleListSectionProps) {
  const principles = pageType.principles ?? [];

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-inner shadow-black/40">
      <BackLink href={homePath} label="Back home" />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Principles
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Core rules behind effective landing pages
        </h2>
        <p className="text-sm text-slate-300">
          Use these to audit every section of <PeopleAwareText text={pageType.title} /> work.
        </p>
      </header>

      {principles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-800/70 p-4 text-sm text-slate-400">
          No principles configured yet. Add a few to keep every section accountable.
        </p>
      ) : (
        <div className="space-y-3">
          {principles.map((principle) => (
            <Link
              key={principle.id}
              href={principleDetailPath(pageType.id, principle.id)}
              className="block w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900"
            >
              <p className="text-base font-semibold text-white">
                <PeopleAwareText text={principle.title} />
              </p>
              <p className="mt-1 text-sm text-slate-300">
                <PeopleAwareText text={principle.definition} />
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
