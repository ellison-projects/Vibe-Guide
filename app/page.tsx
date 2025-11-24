"use client";

import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getBucketById,
  getPageTypeById,
  getPersonaById,
  getPrincipleById,
  getTermInBucket,
  getTermsByBucketId,
  pageTypes,
  type PageType,
  type PersonaStyle,
  type Principle,
  type TermWithBucket,
  type VocabularyBucket,
} from "@/lib/data";

const VIEW_HOME = { type: "home" } as const;

type ViewState =
  | typeof VIEW_HOME
  | { type: "promptList"; pageTypeId: string }
  | { type: "promptDetail"; pageTypeId: string; personaId: string }
  | { type: "vocabList"; pageTypeId: string }
  | { type: "vocabDetail"; pageTypeId: string; termId: string }
  | { type: "principleList"; pageTypeId: string }
  | { type: "principleDetail"; pageTypeId: string; principleId: string };

function VocabularyApp() {
  const [view, setView] = useState<ViewState>(VIEW_HOME);
  const [isOliModalOpen, setIsOliModalOpen] = useState(false);

  const activePageType =
    view.type === "home" ? undefined : getPageTypeById(view.pageTypeId);

  const activeBucket: VocabularyBucket | undefined = useMemo(() => {
    if (!activePageType) return undefined;
    return getBucketById(activePageType.vocabularyBucketId);
  }, [activePageType]);

  const bucketTerms: TermWithBucket[] = useMemo(() => {
    if (!activePageType) return [];
    return getTermsByBucketId(activePageType.vocabularyBucketId);
  }, [activePageType]);

  const handleOpenPrompts = useCallback((pageTypeId: string) => {
    setView({ type: "promptList", pageTypeId });
  }, []);

  const handleOpenVocabulary = useCallback((pageTypeId: string) => {
    setView({ type: "vocabList", pageTypeId });
  }, []);

  const handleSelectPersona = useCallback((pageTypeId: string, personaId: string) => {
    setView({ type: "promptDetail", pageTypeId, personaId });
  }, []);

  const handleSelectTerm = useCallback((pageTypeId: string, termId: string) => {
    setView({ type: "vocabDetail", pageTypeId, termId });
  }, []);

  const handleOpenPrinciples = useCallback((pageTypeId: string) => {
    setView({ type: "principleList", pageTypeId });
  }, []);

  const handleSelectPrinciple = useCallback(
    (pageTypeId: string, principleId: string) => {
      setView({ type: "principleDetail", pageTypeId, principleId });
    },
    [],
  );

  const handleBackToHome = useCallback(() => setView(VIEW_HOME), []);

  const handleOpenOliModal = useCallback(() => setIsOliModalOpen(true), []);
  const handleCloseOliModal = useCallback(() => setIsOliModalOpen(false), []);

  let content: ReactNode = null;

  if (view.type === "home") {
    content = (
      <HomeScreen
        pageTypes={pageTypes}
        onOpenPrompts={handleOpenPrompts}
        onOpenVocabulary={handleOpenVocabulary}
        onOpenPrinciples={handleOpenPrinciples}
        onShowOliInfo={handleOpenOliModal}
      />
    );
  } else if (!activePageType) {
    content = (
      <MissingState
        label="Missing page type"
        description="That page type is not configured yet."
        onBack={handleBackToHome}
      />
    );
  } else {
    switch (view.type) {
      case "promptList":
        content = (
          <PromptListView
            pageType={activePageType}
            onBack={handleBackToHome}
            onSelectPersona={(personaId) =>
              handleSelectPersona(activePageType.id, personaId)
            }
            onShowOliInfo={handleOpenOliModal}
          />
        );
        break;
      case "promptDetail": {
        const persona = getPersonaById(view.pageTypeId, view.personaId);
        content = persona ? (
          <PromptDetailView
            pageType={activePageType}
            persona={persona}
            onBack={() => setView({ type: "promptList", pageTypeId: activePageType.id })}
            onShowOliInfo={handleOpenOliModal}
          />
        ) : (
          <MissingState
            label="Prompt not found"
            description="Pick another style or head back home."
            onBack={() => setView({ type: "promptList", pageTypeId: activePageType.id })}
          />
        );
        break;
      }
      case "vocabList":
        content = (
          <VocabularyListView
            pageType={activePageType}
            terms={bucketTerms}
            onBack={handleBackToHome}
            onSelectTerm={(termId) =>
              handleSelectTerm(activePageType.id, termId)
            }
            onShowOliInfo={handleOpenOliModal}
          />
        );
        break;
      case "vocabDetail": {
        const term = getTermInBucket(activePageType.vocabularyBucketId, view.termId);
        content = term ? (
          <VocabularyDetailView
            term={term}
            onBack={() =>
              setView({ type: "vocabList", pageTypeId: activePageType.id })
            }
            onShowOliInfo={handleOpenOliModal}
          />
        ) : (
          <MissingState
            label="Term not found"
            description="Select another term to keep learning."
            onBack={() => setView({ type: "vocabList", pageTypeId: activePageType.id })}
          />
        );
        break;
      }
      case "principleList":
        content = (
          <PrincipleListView
            pageType={activePageType}
            onBack={handleBackToHome}
            onSelectPrinciple={(principleId) =>
              handleSelectPrinciple(activePageType.id, principleId)
            }
            onShowOliInfo={handleOpenOliModal}
          />
        );
        break;
      case "principleDetail": {
        const principle = getPrincipleById(
          view.pageTypeId,
          view.principleId,
        );
        content = principle ? (
          <PrincipleDetailView
            pageType={activePageType}
            principle={principle}
            onBack={() =>
              setView({
                type: "principleList",
                pageTypeId: activePageType.id,
              })
            }
            onShowOliInfo={handleOpenOliModal}
          />
        ) : (
          <MissingState
            label="Principle not found"
            description="Pick another principle to keep the teardown moving."
            onBack={() =>
              setView({
                type: "principleList",
                pageTypeId: activePageType.id,
              })
            }
          />
        );
        break;
      }
      default:
        content = (
          <MissingState
            label="Unknown view"
            description="Return home to restart the flow."
            onBack={handleBackToHome}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {content}
      </div>
      <OliInfoModal open={isOliModalOpen} onClose={handleCloseOliModal} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Loading landing page coach…
          </p>
        </div>
      }
    >
      <VocabularyApp />
    </Suspense>
  );
}

type HomeScreenProps = {
  pageTypes: PageType[];
  onOpenPrompts: (pageTypeId: string) => void;
  onOpenVocabulary: (pageTypeId: string) => void;
  onOpenPrinciples: (pageTypeId: string) => void;
  onShowOliInfo: () => void;
};

function HomeScreen({
  pageTypes,
  onOpenPrompts,
  onOpenVocabulary,
  onOpenPrinciples,
  onShowOliInfo,
}: HomeScreenProps) {
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
              {renderOliAwareText(pageType.title, onShowOliInfo)}
            </h2>
            <p className="text-sm text-slate-300">
              {renderOliAwareText(pageType.description, onShowOliInfo)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HomeActionButton
              title="AI Prompts"
              description="Styles and people to channel"
              onClick={() => onOpenPrompts(pageType.id)}
            />
            <HomeActionButton
              title="Vocabulary"
              description="Structural components used when building landing pages"
              onClick={() => onOpenVocabulary(pageType.id)}
            />
            <HomeActionButton
              title="Principles"
              description="Core rules behind effective landing pages"
              onClick={() => onOpenPrinciples(pageType.id)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

type HomeActionButtonProps = {
  title: string;
  description: string;
  onClick: () => void;
};

function HomeActionButton({ title, description, onClick }: HomeActionButtonProps) {
  return (
    <button
      className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900"
      onClick={onClick}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-base text-slate-100">{description}</p>
    </button>
  );
}

type PromptListViewProps = {
  pageType: PageType;
  onBack: () => void;
  onSelectPersona: (personaId: string) => void;
  onShowOliInfo: () => void;
};

function PromptListView({ pageType, onBack, onSelectPersona, onShowOliInfo }: PromptListViewProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-inner shadow-black/40">
      <BackButton label="Back home" onClick={onBack} />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          AI Prompts
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Styles and people to channel for {renderOliAwareText(pageType.title, onShowOliInfo)}
        </h2>
      </header>

      <div className="space-y-3">
        {pageType.prompts.map((persona) => (
          <button
            key={persona.id}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900"
            onClick={() => onSelectPersona(persona.id)}
          >
            <p className="text-base font-semibold text-white">
              {renderOliAwareText(persona.name, onShowOliInfo)}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {renderOliAwareText(persona.shortDescription, onShowOliInfo)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

type PromptDetailViewProps = {
  pageType: PageType;
  persona: PersonaStyle;
  onBack: () => void;
  onShowOliInfo: () => void;
};

function PromptDetailView({ pageType, persona, onBack, onShowOliInfo }: PromptDetailViewProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(persona.prompt);
      setCopied(true);
    } catch (error) {
      console.error("Unable to copy prompt", error);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10">
      <BackButton label="Back to AI prompts" onClick={onBack} />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Prompt detail
        </p>
        <h2 className="text-2xl font-semibold text-white">
          {renderOliAwareText(persona.name, onShowOliInfo)}
        </h2>
        <p className="text-sm text-slate-300">
          {renderOliAwareText(persona.shortDescription, onShowOliInfo)}
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-300">
          {renderOliAwareText(pageType.title, onShowOliInfo)}
        </p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-100">
        {renderOliAwareText(persona.prompt, onShowOliInfo)}
      </div>

      <button
        className="inline-flex items-center gap-2 rounded-full border border-emerald-400/70 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-400/10"
        onClick={handleCopy}
      >
        {copied ? "Copied" : "Copy prompt"}
      </button>
    </section>
  );
}

type VocabularyListViewProps = {
  pageType: PageType;
  terms: TermWithBucket[];
  onBack: () => void;
  onSelectTerm: (termId: string) => void;
  onShowOliInfo: () => void;
};

function VocabularyListView({ pageType, terms, onBack, onSelectTerm, onShowOliInfo }: VocabularyListViewProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-inner shadow-black/40">
      <BackButton label="Back home" onClick={onBack} />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Vocabulary
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Structural components used when building landing pages
        </h2>
        <p className="text-sm text-slate-300">
          Everything here ladders up to {renderOliAwareText(pageType.title, onShowOliInfo)} workflows.
        </p>
      </header>

      <div className="space-y-3">
        {terms.map((term) => (
          <button
            key={term.id}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900"
            onClick={() => onSelectTerm(term.id)}
          >
            <p className="text-base font-semibold text-white">
              {renderOliAwareText(term.title, onShowOliInfo)}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {renderOliAwareText(term.shortDescription, onShowOliInfo)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

type VocabularyDetailViewProps = {
  term: TermWithBucket;
  onBack: () => void;
  onShowOliInfo: () => void;
};

function VocabularyDetailView({ term, onBack, onShowOliInfo }: VocabularyDetailViewProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10">
      <BackButton label="Back to vocabulary" onClick={onBack} />
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Term definition
        </p>
        <h2 className="text-2xl font-semibold text-white">
          {renderOliAwareText(term.title, onShowOliInfo)}
        </h2>
      </header>
      <p className="text-base text-slate-200">
        {renderOliAwareText(term.definition, onShowOliInfo)}
      </p>
      {term.examples && term.examples.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Example
          </p>
          <p className="mt-2 text-sm text-slate-100">
            {renderOliAwareText(term.examples[0], onShowOliInfo)}
          </p>
        </div>
      )}
    </section>
  );
}

type PrincipleListViewProps = {
  pageType: PageType;
  onBack: () => void;
  onSelectPrinciple: (principleId: string) => void;
  onShowOliInfo: () => void;
};

function PrincipleListView({
  pageType,
  onBack,
  onSelectPrinciple,
  onShowOliInfo,
}: PrincipleListViewProps) {
  const principles = pageType.principles ?? [];

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-inner shadow-black/40">
      <BackButton label="Back home" onClick={onBack} />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Principles
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Core rules behind effective landing pages
        </h2>
        <p className="text-sm text-slate-300">
          Use these to audit every section of {renderOliAwareText(pageType.title, onShowOliInfo)} work.
        </p>
      </header>

      {principles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-800/70 p-4 text-sm text-slate-400">
          No principles configured yet. Add a few to keep every section accountable.
        </p>
      ) : (
        <div className="space-y-3">
          {principles.map((principle) => (
            <button
              key={principle.id}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900"
              onClick={() => onSelectPrinciple(principle.id)}
            >
              <p className="text-base font-semibold text-white">
                {renderOliAwareText(principle.title, onShowOliInfo)}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {renderOliAwareText(principle.definition, onShowOliInfo)}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

type PrincipleDetailViewProps = {
  pageType: PageType;
  principle: Principle;
  onBack: () => void;
  onShowOliInfo: () => void;
};

function PrincipleDetailView({
  pageType,
  principle,
  onBack,
  onShowOliInfo,
}: PrincipleDetailViewProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10">
      <BackButton label="Back to principles" onClick={onBack} />
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Principle
        </p>
        <h2 className="text-2xl font-semibold text-white">
          {renderOliAwareText(principle.title, onShowOliInfo)}
        </h2>
      </header>
      <div className="space-y-3 text-sm text-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Definition
          </p>
          <p className="mt-1">
            {renderOliAwareText(principle.definition, onShowOliInfo)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Why it matters
          </p>
          <p className="mt-1">
            {renderOliAwareText(principle.whyItMatters, onShowOliInfo)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Example
          </p>
          <p className="mt-2">
            {renderOliAwareText(principle.example, onShowOliInfo)}
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
          Applies to {renderOliAwareText(pageType.title, onShowOliInfo)}
        </p>
      </div>
    </section>
  );
}

type BackButtonProps = {
  label: string;
  onClick: () => void;
};

function BackButton({ label, onClick }: BackButtonProps) {
  return (
    <button
      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-white"
      onClick={onClick}
    >
      <span aria-hidden>↩</span>
      {label}
    </button>
  );
}

type MissingStateProps = {
  label: string;
  description: string;
  onBack: () => void;
};

function MissingState({ label, description, onBack }: MissingStateProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-dashed border-slate-800 bg-slate-900/70 p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className="text-base text-slate-300">{description}</p>
      <button
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-emerald-400 hover:text-white"
        onClick={onBack}
      >
        Go home
      </button>
    </section>
  );
}

const OLI_GARDNER_NAME = "Oli Gardner";

function renderOliAwareText(text: string, onShowOliInfo: () => void): ReactNode {
  if (!text.includes(OLI_GARDNER_NAME)) {
    return text;
  }

  const parts = text.split(OLI_GARDNER_NAME);
  return (
    <span>
      {parts.map((part, index) => (
        <Fragment key={`oli-fragment-${index}`}>
          {part}
          {index < parts.length - 1 && (
            <button
              type="button"
              className="inline font-semibold text-emerald-300 underline decoration-dotted underline-offset-4 transition hover:text-emerald-200"
              onClick={onShowOliInfo}
            >
              {OLI_GARDNER_NAME}
            </button>
          )}
        </Fragment>
      ))}
    </span>
  );
}

type OliInfoModalProps = {
  open: boolean;
  onClose: () => void;
};

function OliInfoModal({ open, onClose }: OliInfoModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Who is Oli Gardner"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 text-left text-slate-100 shadow-2xl shadow-emerald-500/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
              Conversion mentor
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Who is {OLI_GARDNER_NAME}?
            </h2>
          </div>
          <button
            className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-slate-400 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm text-slate-300">
          <p>
            {OLI_GARDNER_NAME} co-founded Unbounce and is famous for obsessive landing page experiments, attention ratio discipline, and high-converting copy frameworks.
          </p>
          <p>
            We channel his lens to keep this vocabulary focused on ruthless clarity: one page, one goal; clarity over clever; visual hierarchy or bust.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-200/90">
            <li>Every element must push toward a single CTA.</li>
            <li>Headlines answer what and why before they get witty.</li>
            <li>Visual order, proof, and friction removal build conversion momentum.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
