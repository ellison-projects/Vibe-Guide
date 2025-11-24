import Link from "next/link";

import PeopleAwareText from "@/components/person/PeopleAwareText";
import {
  principleListPath,
  promptListPath,
  vocabularyListPath,
} from "@/lib/paths";
import type { PageType } from "@/lib/data";

type HomeScreenProps = {
  pageTypes: PageType[];
};

export default function HomeScreen({ pageTypes }: HomeScreenProps) {
  return (
    <div className="space-y-6">
      {pageTypes.map((pageType) => (
        <article
          key={pageType.id}
          className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-inner shadow-black/30"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Page type
            </p>
            <h2 className="text-2xl font-semibold text-white">
              <PeopleAwareText text={pageType.title} />
            </h2>
            <p className="text-sm text-slate-300">
              <PeopleAwareText text={pageType.description} />
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HomeActionLink
              title="AI Prompts"
              description="Styles and people to channel"
              href={promptListPath(pageType.id)}
            />
            <HomeActionLink
              title="Vocabulary"
              description="Structural components for landing pages"
              href={vocabularyListPath(pageType.id)}
            />
            <HomeActionLink
              title="Principles"
              description="Core rules behind effective landing pages"
              href={principleListPath(pageType.id)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

type HomeActionLinkProps = {
  title: string;
  description: string;
  href: string;
};

function HomeActionLink({ title, description, href }: HomeActionLinkProps) {
  return (
    <Link
      href={href}
      className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-1 text-base text-slate-100">{description}</p>
    </Link>
  );
}
