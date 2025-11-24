import BackLink from "@/components/common/BackLink";
import PeopleAwareText from "@/components/person/PeopleAwareText";
import CopyPromptButton from "@/components/prompts/CopyPromptButton";
import { promptListPath } from "@/lib/paths";
import type { PageType, PersonaStyle } from "@/lib/data";

type PromptDetailSectionProps = {
  pageType: PageType;
  persona: PersonaStyle;
};

export default function PromptDetailSection({ pageType, persona }: PromptDetailSectionProps) {
  const backHref = promptListPath(pageType.id);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/85 p-6 shadow-2xl shadow-emerald-500/10">
      <div className="space-y-6">
        <div className="space-y-4">
          <BackLink href={backHref} label="Back to AI prompts" />
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Channel prompt
            </p>
            <h2 className="text-3xl font-semibold text-white">
              <PeopleAwareText text={persona.name} />
            </h2>
            <p className="text-sm text-slate-300">
              <PeopleAwareText text={persona.shortDescription} />
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-300">
              <PeopleAwareText text={pageType.title} />
            </p>
          </header>
        </div>

        <div className="rounded-2xl border border-emerald-400/40 bg-slate-950/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Primary action
          </p>
          <CopyPromptButton prompt={persona.prompt} />
          <p className="mt-2 text-xs text-slate-300">
            Copies the full refactor brief so you can drop it into your editor.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Prompt ready to paste
          </p>
          <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-100">
            <PeopleAwareText text={persona.prompt} />
          </div>
        </div>
      </div>
    </section>
  );
}
