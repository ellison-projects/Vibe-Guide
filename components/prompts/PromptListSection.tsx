import Link from "next/link";

import BackLink from "@/components/common/BackLink";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import { homePath, promptDetailPath } from "@/lib/paths";
import type { PageType } from "@/lib/data";

type PromptListSectionProps = {
  pageType: PageType;
};

export default function PromptListSection({ pageType }: PromptListSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-inner shadow-black/40">
      <BackLink href={homePath} label="Back home" />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          AI Prompts
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Styles and people to channel for <PeopleAwareText text={pageType.title} />
        </h2>
      </header>

      <div className="space-y-3">
        {pageType.prompts.map((persona) => (
          <Link
            key={persona.id}
            href={promptDetailPath(pageType.id, persona.id)}
            className="block w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900"
          >
            <p className="text-base font-semibold text-white">
              <PeopleAwareText text={persona.name} />
            </p>
            <p className="mt-1 text-sm text-slate-300">
              <PeopleAwareText text={persona.shortDescription} />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
