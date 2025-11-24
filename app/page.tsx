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
  usePathname,
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";

import {
  getPageTypeById,
  getPersonaById,
  getPersonById,
  getPrincipleById,
  getTermInBucket,
  getTermsByBucketId,
  pageTypes,
  people,
  type PageType,
  type PersonaStyle,
  type Person,
  type Principle,
  type TermWithBucket,
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

type BreadcrumbItem = {
  id: string;
  label: ReactNode;
  onClick?: () => void;
  isCurrent?: boolean;
};

const PERSON_NAME_TO_ID = new Map(people.map((person) => [person.name, person.id]));
const PERSON_NAME_REGEX_SOURCE = Array.from(PERSON_NAME_TO_ID.keys())
  .sort((a, b) => b.length - a.length)
  .map((name) => escapeRegExp(name))
  .join("|");

function VocabularyApp() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = useMemo(() => deriveViewFromSearchParams(searchParams), [searchParams]);
  const [activePersonId, setActivePersonId] = useState<string | null>(null);

  const navigateToView = useCallback(
    (nextView: ViewState) => {
      const searchString = getSearchStringForView(nextView);
      const target = searchString ? `${pathname}?${searchString}` : pathname;
      router.push(target, { scroll: false });
    },
    [pathname, router],
  );

  const activePageType =
    view.type === "home" ? undefined : getPageTypeById(view.pageTypeId);

  const bucketTerms: TermWithBucket[] = useMemo(() => {
    if (!activePageType) return [];
    return getTermsByBucketId(activePageType.vocabularyBucketId);
  }, [activePageType]);

  const activePersona =
    view.type === "promptDetail"
      ? getPersonaById(view.pageTypeId, view.personaId)
      : undefined;

  const activeTerm =
    view.type === "vocabDetail" && activePageType
      ? getTermInBucket(activePageType.vocabularyBucketId, view.termId)
      : undefined;

  const activePrinciple =
    view.type === "principleDetail"
      ? getPrincipleById(view.pageTypeId, view.principleId)
      : undefined;

  const activePerson = activePersonId ? getPersonById(activePersonId) : undefined;

  const handleOpenPrompts = useCallback(
    (pageTypeId: string) => {
      navigateToView({ type: "promptList", pageTypeId });
    },
    [navigateToView],
  );

  const handleOpenVocabulary = useCallback(
    (pageTypeId: string) => {
      navigateToView({ type: "vocabList", pageTypeId });
    },
    [navigateToView],
  );

  const handleSelectPersona = useCallback(
    (pageTypeId: string, personaId: string) => {
      navigateToView({ type: "promptDetail", pageTypeId, personaId });
    },
    [navigateToView],
  );

  const handleSelectTerm = useCallback(
    (pageTypeId: string, termId: string) => {
      navigateToView({ type: "vocabDetail", pageTypeId, termId });
    },
    [navigateToView],
  );

  const handleOpenPrinciples = useCallback(
    (pageTypeId: string) => {
      navigateToView({ type: "principleList", pageTypeId });
    },
    [navigateToView],
  );

  const handleSelectPrinciple = useCallback(
    (pageTypeId: string, principleId: string) => {
      navigateToView({ type: "principleDetail", pageTypeId, principleId });
    },
    [navigateToView],
  );

  const handleBackToHome = useCallback(() => navigateToView(VIEW_HOME), [navigateToView]);

  const handleShowPersonInfo = useCallback((personId: string) => {
    if (!personId) return;
    setActivePersonId(personId);
  }, []);
  const handleClosePersonModal = useCallback(() => setActivePersonId(null), []);

  let content: ReactNode = null;

  if (view.type === "home") {
    content = (
      <HomeScreen
        pageTypes={pageTypes}
        onOpenPrompts={handleOpenPrompts}
        onOpenVocabulary={handleOpenVocabulary}
        onOpenPrinciples={handleOpenPrinciples}
        onShowPersonInfo={handleShowPersonInfo}
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
            onShowPersonInfo={handleShowPersonInfo}
          />
        );
        break;
      case "promptDetail":
        content = activePersona ? (
          <PromptDetailView
            pageType={activePageType}
            persona={activePersona}
            onBack={() => handleOpenPrompts(activePageType.id)}
            onShowPersonInfo={handleShowPersonInfo}
          />
        ) : (
          <MissingState
            label="Prompt not found"
            description="Pick another style or head back home."
            onBack={() => handleOpenPrompts(activePageType.id)}
          />
        );
        break;
      case "vocabList":
        content = (
          <VocabularyListView
            pageType={activePageType}
            terms={bucketTerms}
            onBack={handleBackToHome}
            onSelectTerm={(termId) =>
              handleSelectTerm(activePageType.id, termId)
            }
            onShowPersonInfo={handleShowPersonInfo}
          />
        );
        break;
      case "vocabDetail":
        content = activeTerm ? (
          <VocabularyDetailView
            term={activeTerm}
            onBack={() => handleOpenVocabulary(activePageType.id)}
            onShowPersonInfo={handleShowPersonInfo}
          />
        ) : (
          <MissingState
            label="Term not found"
            description="Select another term to keep learning."
            onBack={() => handleOpenVocabulary(activePageType.id)}
          />
        );
        break;
      case "principleList":
        content = (
          <PrincipleListView
            pageType={activePageType}
            onBack={handleBackToHome}
            onSelectPrinciple={(principleId) =>
              handleSelectPrinciple(activePageType.id, principleId)
            }
            onShowPersonInfo={handleShowPersonInfo}
          />
        );
        break;
      case "principleDetail":
        content = activePrinciple ? (
          <PrincipleDetailView
            pageType={activePageType}
            principle={activePrinciple}
            onBack={() => handleOpenPrinciples(activePageType.id)}
            onShowPersonInfo={handleShowPersonInfo}
          />
        ) : (
          <MissingState
            label="Principle not found"
            description="Pick another principle to keep the teardown moving."
            onBack={() => handleOpenPrinciples(activePageType.id)}
          />
        );
        break;
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

  const breadcrumbs = useMemo(() => {
    if (view.type === "home") return undefined;

    const items: BreadcrumbItem[] = [
      {
        id: "home",
        label: "Home",
        onClick: handleBackToHome,
      },
    ];

    if (activePageType) {
      items.push({
        id: `page-type-${activePageType.id}`,
        label: renderPeopleAwareText(activePageType.title, handleShowPersonInfo),
      });
    }

    const addSectionCrumb = (
      id: string,
      label: ReactNode,
      options: { onClick?: () => void; isCurrent?: boolean } = {},
    ) => {
      items.push({
        id,
        label,
        ...options,
      });
    };

    switch (view.type) {
      case "promptList":
        addSectionCrumb("section-prompts", "AI Prompts", { isCurrent: true });
        break;
      case "promptDetail":
        addSectionCrumb("section-prompts", "AI Prompts", {
          onClick: () => handleOpenPrompts(view.pageTypeId),
        });
        addSectionCrumb(
          `persona-${view.personaId}`,
          activePersona
            ? renderPeopleAwareText(activePersona.name, handleShowPersonInfo)
            : "Prompt detail",
          { isCurrent: true },
        );
        break;
      case "vocabList":
        addSectionCrumb("section-vocab", "Vocabulary", { isCurrent: true });
        break;
      case "vocabDetail":
        addSectionCrumb("section-vocab", "Vocabulary", {
          onClick: () => handleOpenVocabulary(view.pageTypeId),
        });
        addSectionCrumb(
          `term-${view.termId}`,
          activeTerm
            ? renderPeopleAwareText(activeTerm.title, handleShowPersonInfo)
            : "Term detail",
          { isCurrent: true },
        );
        break;
      case "principleList":
        addSectionCrumb("section-principles", "Principles", { isCurrent: true });
        break;
      case "principleDetail":
        addSectionCrumb("section-principles", "Principles", {
          onClick: () => handleOpenPrinciples(view.pageTypeId),
        });
        addSectionCrumb(
          `principle-${view.principleId}`,
          activePrinciple
            ? renderPeopleAwareText(activePrinciple.title, handleShowPersonInfo)
            : "Principle detail",
          { isCurrent: true },
        );
        break;
      default:
        break;
    }

    return items;
  }, [
    view,
    activePageType,
    activePersona,
    activeTerm,
    activePrinciple,
    handleBackToHome,
    handleOpenPrompts,
    handleOpenVocabulary,
    handleOpenPrinciples,
    handleShowPersonInfo,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {content}
      </div>
      <PersonInfoModal person={activePerson} onClose={handleClosePersonModal} />
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
  onShowPersonInfo: (personId: string) => void;
};

function HomeScreen({
  pageTypes,
  onOpenPrompts,
  onOpenVocabulary,
  onOpenPrinciples,
  onShowPersonInfo,
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
              {renderPeopleAwareText(pageType.title, onShowPersonInfo)}
            </h2>
            <p className="text-sm text-slate-300">
              {renderPeopleAwareText(pageType.description, onShowPersonInfo)}
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
  onShowPersonInfo: (personId: string) => void;
};

function PromptListView({ pageType, onBack, onSelectPersona, onShowPersonInfo }: PromptListViewProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-inner shadow-black/40">
      <BackButton label="Back home" onClick={onBack} />
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          AI Prompts
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Styles and people to channel for {renderPeopleAwareText(pageType.title, onShowPersonInfo)}
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
              {renderPeopleAwareText(persona.name, onShowPersonInfo)}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {renderPeopleAwareText(persona.shortDescription, onShowPersonInfo)}
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
  onShowPersonInfo: (personId: string) => void;
};

function PromptDetailView({ pageType, persona, onBack, onShowPersonInfo }: PromptDetailViewProps) {
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
          {renderPeopleAwareText(persona.name, onShowPersonInfo)}
        </h2>
        <p className="text-sm text-slate-300">
          {renderPeopleAwareText(persona.shortDescription, onShowPersonInfo)}
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-300">
          {renderPeopleAwareText(pageType.title, onShowPersonInfo)}
        </p>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-100">
        {renderPeopleAwareText(persona.prompt, onShowPersonInfo)}
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
  onShowPersonInfo: (personId: string) => void;
};

function VocabularyListView({ pageType, terms, onBack, onSelectTerm, onShowPersonInfo }: VocabularyListViewProps) {
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
          Everything here ladders up to {renderPeopleAwareText(pageType.title, onShowPersonInfo)} workflows.
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
              {renderPeopleAwareText(term.title, onShowPersonInfo)}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {renderPeopleAwareText(term.shortDescription, onShowPersonInfo)}
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
  onShowPersonInfo: (personId: string) => void;
};

function VocabularyDetailView({ term, onBack, onShowPersonInfo }: VocabularyDetailViewProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10">
      <BackButton label="Back to vocabulary" onClick={onBack} />
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Term definition
        </p>
        <h2 className="text-2xl font-semibold text-white">
          {renderPeopleAwareText(term.title, onShowPersonInfo)}
        </h2>
      </header>
      <p className="text-base text-slate-200">
        {renderPeopleAwareText(term.definition, onShowPersonInfo)}
      </p>
      {term.examples && term.examples.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Example
          </p>
          <p className="mt-2 text-sm text-slate-100">
            {renderPeopleAwareText(term.examples[0], onShowPersonInfo)}
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
  onShowPersonInfo: (personId: string) => void;
};

function PrincipleListView({
  pageType,
  onBack,
  onSelectPrinciple,
  onShowPersonInfo,
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
          Use these to audit every section of {renderPeopleAwareText(pageType.title, onShowPersonInfo)} work.
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
              {renderPeopleAwareText(principle.title, onShowPersonInfo)}
              </p>
              <p className="mt-1 text-sm text-slate-300">
              {renderPeopleAwareText(principle.definition, onShowPersonInfo)}
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
  onShowPersonInfo: (personId: string) => void;
};

function PrincipleDetailView({
  pageType,
  principle,
  onBack,
  onShowPersonInfo,
}: PrincipleDetailViewProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-emerald-500/10">
      <BackButton label="Back to principles" onClick={onBack} />
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
          Principle
        </p>
        <h2 className="text-2xl font-semibold text-white">
          {renderPeopleAwareText(principle.title, onShowPersonInfo)}
        </h2>
      </header>
      <div className="space-y-3 text-sm text-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Definition
          </p>
          <p className="mt-1">
            {renderPeopleAwareText(principle.definition, onShowPersonInfo)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Why it matters
          </p>
          <p className="mt-1">
            {renderPeopleAwareText(principle.whyItMatters, onShowPersonInfo)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Example
          </p>
          <p className="mt-2">
            {renderPeopleAwareText(principle.example, onShowPersonInfo)}
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
          Applies to {renderPeopleAwareText(pageType.title, onShowPersonInfo)}
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

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="rounded-3xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isInteractive = Boolean(item.onClick) && !item.isCurrent;
          const baseClasses = item.isCurrent ? "text-white" : "text-slate-400";

          return (
            <li key={item.id} className="flex items-center gap-2">
              {isInteractive ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`text-[0.65rem] font-semibold uppercase tracking-[0.35em] transition hover:text-white ${baseClasses}`}
                >
                  {item.label}
                </button>
              ) : (
                <span className={baseClasses}>{item.label}</span>
              )}
              {index < items.length - 1 && <span className="text-slate-700">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
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

function renderPeopleAwareText(
  text: string,
  onShowPersonInfo: (personId: string) => void,
): ReactNode {
  if (!text || !PERSON_NAME_REGEX_SOURCE) {
    return text;
  }

  const regex = new RegExp(PERSON_NAME_REGEX_SOURCE, "g");
  if (!regex.test(text)) {
    return text;
  }
  regex.lastIndex = 0;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      nodes.push(
        <Fragment key={`text-${key++}`}>{text.slice(lastIndex, matchIndex)}</Fragment>,
      );
    }

    const matchedName = match[0];
    const personId = PERSON_NAME_TO_ID.get(matchedName);

    nodes.push(
      personId ? (
        <button
          type="button"
          key={`person-${personId}-${key++}`}
          className="inline font-semibold text-emerald-300 underline decoration-dotted underline-offset-4 transition hover:text-emerald-200"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onShowPersonInfo(personId);
          }}
        >
          {matchedName}
        </button>
      ) : (
        <Fragment key={`text-${key++}`}>{matchedName}</Fragment>
      ),
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`text-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }

  return <span>{nodes}</span>;
}

type PersonInfoModalProps = {
  person?: Person;
  onClose: () => void;
};

function PersonInfoModal({ person, onClose }: PersonInfoModalProps) {
  const open = Boolean(person);

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

  if (!person) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Who is ${person.name}?`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/95 p-6 text-left text-slate-100 shadow-2xl shadow-emerald-500/10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
              {person.label}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Who is {person.name}?</h2>
          </div>
          <button
            className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-slate-400 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm text-slate-300">
          {person.description.map((paragraph, index) => (
            <p key={`person-description-${person.id}-${index}`}>{paragraph}</p>
          ))}
          {person.bullets && person.bullets.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-slate-200/90">
              {person.bullets.map((bullet, index) => (
                <li key={`person-bullet-${person.id}-${index}`}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveViewFromSearchParams(searchParams: ReadonlyURLSearchParams): ViewState {
  const viewParam = searchParams.get("view");

  if (!viewParam) {
    return VIEW_HOME;
  }

  const pageTypeId = searchParams.get("pageTypeId");

  switch (viewParam) {
    case "promptList":
      if (!pageTypeId) return VIEW_HOME;
      return { type: "promptList", pageTypeId };
    case "promptDetail": {
      const personaId = searchParams.get("personaId");
      if (!pageTypeId || !personaId) return VIEW_HOME;
      return { type: "promptDetail", pageTypeId, personaId };
    }
    case "vocabList":
      if (!pageTypeId) return VIEW_HOME;
      return { type: "vocabList", pageTypeId };
    case "vocabDetail": {
      const termId = searchParams.get("termId");
      if (!pageTypeId || !termId) return VIEW_HOME;
      return { type: "vocabDetail", pageTypeId, termId };
    }
    case "principleList":
      if (!pageTypeId) return VIEW_HOME;
      return { type: "principleList", pageTypeId };
    case "principleDetail": {
      const principleId = searchParams.get("principleId");
      if (!pageTypeId || !principleId) return VIEW_HOME;
      return { type: "principleDetail", pageTypeId, principleId };
    }
    default:
      return VIEW_HOME;
  }
}

function getSearchStringForView(view: ViewState) {
  if (view.type === "home") {
    return "";
  }

  const params = new URLSearchParams();
  params.set("view", view.type);

  if ("pageTypeId" in view) {
    params.set("pageTypeId", view.pageTypeId);
  }

  if ("personaId" in view) {
    params.set("personaId", view.personaId);
  }

  if ("termId" in view) {
    params.set("termId", view.termId);
  }

  if ("principleId" in view) {
    params.set("principleId", view.principleId);
  }

  return params.toString();
}
