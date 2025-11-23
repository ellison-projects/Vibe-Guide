"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SVGProps,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  allTerms,
  buckets,
  getBucketById,
  getTermById,
  type TermWithBucket,
  type VocabularyBucket,
  type VocabularyTerm,
} from "@/lib/data";
import { cn } from "@/lib/utils";

type TabId = "home" | "categories" | "search";
type ParamKey = "tab" | "bucket" | "term" | "q";

const tabs: Array<{ id: TabId; label: string; description: string }> = [
  { id: "home", label: "Home", description: "Overview & recents" },
  { id: "categories", label: "Categories", description: "Explore buckets" },
  { id: "search", label: "Search", description: "Find specific terms" },
];

const tabIds: TabId[] = ["home", "categories", "search"];
const suggestedTerms = allTerms.slice(0, 6);

const isTabId = (value: string | null): value is TabId =>
  tabIds.includes(value as TabId);

function VocabularyApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recentTerms, setRecentTerms] = useState<TermWithBucket[]>([]);

  const tabParam = searchParams.get("tab");
  const activeTab: TabId = isTabId(tabParam) ? tabParam : "home";

  const selectedTermId = searchParams.get("term");
  const selectedTerm = getTermById(selectedTermId) ?? null;

  const bucketParam = searchParams.get("bucket");
  const fallbackBucketId = selectedTerm?.bucketId ?? buckets[0]?.id ?? "";
  const selectedBucket =
    getBucketById(bucketParam) ??
    (fallbackBucketId ? getBucketById(fallbackBucketId) : undefined);
  const searchQuery = searchParams.get("q") ?? "";

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return allTerms.filter((term) => {
      const haystack = `${term.title} ${term.shortDescription} ${term.definition} ${term.whenToUse} ${term.bucketTitle}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery]);

  const updateParams = useCallback(
    (changes: Partial<Record<ParamKey, string | null>>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    },
    [router, searchParams],
  );

  const handleTabChange = useCallback(
    (tab: TabId) => {
      updateParams({ tab: tab === "home" ? null : tab });
    },
    [updateParams],
  );

  const handleSelectBucket = useCallback(
    (bucketId: string) => {
      updateParams({ tab: "categories", bucket: bucketId, term: null });
    },
    [updateParams],
  );

  const handleSelectTerm = useCallback(
    (term: TermWithBucket) => {
      setRecentTerms((prev) => {
        const filtered = prev.filter((item) => item.id !== term.id);
        return [term, ...filtered].slice(0, 6);
      });
      updateParams({ term: term.id, bucket: term.bucketId });
    },
    [updateParams],
  );

  const handleClearTerm = useCallback(() => {
    updateParams({ term: null });
  }, [updateParams]);

  const handleQueryChange = useCallback(
    (value: string) => {
      updateParams({
        tab: "search",
        q: value.length ? value : null,
        term: null,
      });
    },
    [updateParams],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-6 lg:flex-row lg:pb-10 lg:gap-10">
        <div className="flex-1 space-y-6">
          <BreadcrumbsBar
            activeTab={activeTab}
            selectedBucket={selectedBucket}
            selectedTerm={selectedTerm}
            searchQuery={searchQuery}
            onChangeTab={handleTabChange}
            onSelectBucket={handleSelectBucket}
          />

          <DesktopTabs activeTab={activeTab} onChange={handleTabChange} />

          {activeTab === "home" && (
            <HomeView
              buckets={buckets}
              recentTerms={recentTerms}
              onSelectBucket={handleSelectBucket}
              onSelectTerm={handleSelectTerm}
            />
          )}

          {activeTab === "categories" && selectedBucket && (
            <BucketView
              buckets={buckets}
              selectedBucket={selectedBucket}
              onSelectBucket={handleSelectBucket}
              onSelectTerm={handleSelectTerm}
              selectedTermId={selectedTerm?.id ?? null}
            />
          )}

          {activeTab === "search" && (
            <SearchView
              query={searchQuery}
              results={searchResults}
              suggestions={suggestedTerms}
              onQueryChange={handleQueryChange}
              onSelectTerm={handleSelectTerm}
            />
          )}
        </div>

        <section className="w-full lg:max-w-md lg:self-start lg:sticky lg:top-6">
          <TermDetailPanel term={selectedTerm} onClose={handleClearTerm} />
        </section>
      </div>

      <BottomNav activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Loading vocabulary coach…
          </p>
        </div>
      }
    >
      <VocabularyApp />
    </Suspense>
  );
}

type HomeViewProps = {
  buckets: VocabularyBucket[];
  recentTerms: TermWithBucket[];
  onSelectBucket: (bucketId: string) => void;
  onSelectTerm: (term: TermWithBucket) => void;
};

function HomeView({
  buckets,
  recentTerms,
  onSelectBucket,
  onSelectTerm,
}: HomeViewProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-inner shadow-slate-950/40 sm:p-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Start here
          </p>
          <h2 className="text-xl font-semibold text-slate-100 md:text-2xl">
            What are you working on?
          </h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {buckets.map((bucket) => (
            <button
              key={bucket.id}
              className="group rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 text-left transition hover:border-slate-500 hover:bg-slate-900"
              onClick={() => onSelectBucket(bucket.id)}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {bucket.title}
              </p>
              <p className="mt-2 text-base font-medium text-slate-100">
                {bucket.description}
              </p>
              <p className="mt-4 text-xs font-medium text-slate-500">
                {bucket.terms.length} vocabulary terms
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-inner shadow-slate-950/40 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Recently viewed
            </p>
            <h2 className="text-xl font-semibold text-slate-100 md:text-2xl">
              Keep the conversation going
            </h2>
          </div>
          {recentTerms.length > 0 && (
            <span className="text-xs font-medium text-slate-500">
              Last {recentTerms.length} terms
            </span>
          )}
        </header>

        {recentTerms.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-800/80 p-4 text-sm text-slate-400">
            You haven&apos;t opened any terms yet. Pick a bucket to start
            briefing your AI teammate.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recentTerms.map((term) => (
              <button
                key={term.id}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 text-left transition hover:border-slate-500 hover:bg-slate-900"
                onClick={() => onSelectTerm(term)}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {term.bucketTitle}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-100">
                  {term.title}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {term.shortDescription}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type BucketViewProps = {
  buckets: VocabularyBucket[];
  selectedBucket: VocabularyBucket;
  onSelectBucket: (bucketId: string) => void;
  onSelectTerm: (term: TermWithBucket) => void;
  selectedTermId?: string | null;
};

function BucketView({
  buckets,
  selectedBucket,
  onSelectBucket,
  onSelectTerm,
  selectedTermId,
}: BucketViewProps) {
  const terms = selectedBucket.terms.map((term) =>
    attachBucket(term, selectedBucket),
  );
  const shouldCollapseBucketSummary = Boolean(selectedTermId);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/70 p-5 shadow-inner shadow-slate-950/40 sm:p-6">
      {!shouldCollapseBucketSummary && (
        <>
          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Buckets
            </p>
            <h2 className="text-2xl font-semibold text-slate-100">
              {selectedBucket.title}
            </h2>
            <p className="text-sm text-slate-400">
              {selectedBucket.description}
            </p>
          </header>

          <div className="flex flex-wrap gap-2">
            {buckets.map((bucket) => (
              <button
                key={bucket.id}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  bucket.id === selectedBucket.id
                    ? "border-emerald-400/80 bg-emerald-400/10 text-emerald-200"
                    : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-600 hover:text-slate-100",
                )}
                onClick={() => onSelectBucket(bucket.id)}
              >
                {bucket.title}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="grid gap-4">
        {terms.map((term) => (
          <TermCard key={term.id} term={term} onSelect={onSelectTerm} />
        ))}
      </div>
    </div>
  );
}

type SearchViewProps = {
  query: string;
  results: TermWithBucket[];
  suggestions: TermWithBucket[];
  onQueryChange: (value: string) => void;
  onSelectTerm: (term: TermWithBucket) => void;
};

function SearchView({
  query,
  results,
  suggestions,
  onQueryChange,
  onSelectTerm,
}: SearchViewProps) {
  const trimmedQuery = query.trim();
  const showSuggestions = trimmedQuery.length === 0;
  const emptyState = !showSuggestions && results.length === 0;

  return (
    <div className="space-y-5 rounded-3xl border border-slate-800/60 bg-slate-900/70 p-5 shadow-inner shadow-slate-950/40 sm:p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Search the glossary
        </p>
        <h2 className="text-2xl font-semibold text-slate-100">
          Describe any design or UX fix
        </h2>
      </header>

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder='Try "visual hierarchy" or "emptystate copy"'
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 pr-12 text-base text-slate-100 placeholder-slate-500 shadow-inner focus:border-emerald-400 focus:outline-none"
        />
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
          <SearchIcon className="h-5 w-5" />
        </div>
      </div>

      {showSuggestions && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-400">
            Popular searches
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((term) => (
              <SuggestionCard
                key={term.id}
                term={term}
                onSelect={onSelectTerm}
              />
            ))}
          </div>
        </div>
      )}

      {!showSuggestions && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-400">
            {results.length} result{results.length === 1 ? "" : "s"} for {" "}
            <span className="text-slate-100">“{trimmedQuery}”</span>
          </p>
          {emptyState ? (
            <p className="rounded-2xl border border-dashed border-slate-800/80 p-4 text-sm text-slate-400">
              No terms matched that phrase. Try searching for the outcome you
              want (for example: “reduce clutter” or “onboarding copy”).
            </p>
          ) : (
            <div className="grid gap-3">
              {results.map((term) => (
                <TermCard key={term.id} term={term} onSelect={onSelectTerm} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type TermCardProps = {
  term: TermWithBucket;
  onSelect: (term: TermWithBucket) => void;
};

function TermCard({ term, onSelect }: TermCardProps) {
  return (
    <button
      className="group rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/10"
      onClick={() => onSelect(term)}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {term.bucketTitle}
      </p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-100">{term.title}</p>
          <p className="mt-1 text-sm text-slate-400">{term.shortDescription}</p>
        </div>
        <ChevronRightIcon className="mt-1 h-4 w-4 text-slate-500 transition group-hover:text-emerald-300" />
      </div>
    </button>
  );
}

type SuggestionCardProps = {
  term: TermWithBucket;
  onSelect: (term: TermWithBucket) => void;
};

function SuggestionCard({ term, onSelect }: SuggestionCardProps) {
  return (
    <button
      className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4 text-left transition hover:border-emerald-400/60 hover:bg-slate-900/80"
      onClick={() => onSelect(term)}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {term.bucketTitle}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-100">{term.title}</p>
      <p className="mt-1 text-sm text-slate-400">{term.shortDescription}</p>
    </button>
  );
}

type TermDetailPanelProps = {
  term: TermWithBucket | null;
  onClose: () => void;
};

function TermDetailPanel({ term, onClose }: TermDetailPanelProps) {
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedPhrase) return;
    const timeout = setTimeout(() => setCopiedPhrase(null), 1500);
    return () => clearTimeout(timeout);
  }, [copiedPhrase]);

  if (!term) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/70 p-8 text-center text-sm text-slate-400">
        <p>Select any term from Home, Categories, or Search to open the AI coach.</p>
      </div>
    );
  }

  const handleCopy = async (phrase: string) => {
    try {
      await navigator.clipboard.writeText(phrase);
      setCopiedPhrase(phrase);
    } catch (error) {
      console.error("Unable to copy", error);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-emerald-500/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
            {term.bucketTitle}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-100">
            {term.title}
          </h2>
        </div>
        <button
          className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-slate-400 hover:text-white"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-4 text-sm text-slate-300">
        <DetailBlock label="Definition">{term.definition}</DetailBlock>
        <DetailBlock label="When to use it">{term.whenToUse}</DetailBlock>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          AI-ready phrases
        </p>
        <div className="space-y-3">
          {term.aiPhrases.map((phrase) => (
            <div
              key={phrase}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <p className="text-sm text-slate-100">{phrase}</p>
              <button
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300 transition hover:text-emerald-200"
                onClick={() => handleCopy(phrase)}
              >
                <CopyIcon className="h-4 w-4" />
                {copiedPhrase === phrase ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {term.examples && term.examples.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Examples
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            {term.examples.map((example) => (
              <li
                key={example}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3"
              >
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm text-slate-200">{children}</p>
    </div>
  );
}

type BreadcrumbsBarProps = {
  activeTab: TabId;
  selectedBucket?: VocabularyBucket;
  selectedTerm: TermWithBucket | null;
  searchQuery: string;
  onChangeTab: (tab: TabId) => void;
  onSelectBucket: (bucketId: string) => void;
};

function BreadcrumbsBar({
  activeTab,
  selectedBucket,
  selectedTerm,
  searchQuery,
  onChangeTab,
  onSelectBucket,
}: BreadcrumbsBarProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timeout);
  }, [copied]);

  const items = useMemo(() => {
    const crumbs: Array<{ label: string; onClick?: () => void }> = [
      {
        label: "Home",
        onClick: activeTab === "home" ? undefined : () => onChangeTab("home"),
      },
    ];

    if (activeTab === "search") {
      crumbs.push({
        label: "Search",
        onClick: () => onChangeTab("search"),
      });
      if (searchQuery.trim()) {
        crumbs.push({ label: `“${searchQuery.trim()}”` });
      }
    } else if (activeTab === "categories" || selectedTerm) {
      crumbs.push({
        label: "Categories",
        onClick: () => onChangeTab("categories"),
      });
      if (selectedBucket) {
        crumbs.push({
          label: selectedBucket.title,
          onClick: () => onSelectBucket(selectedBucket.id),
        });
      }
    }

    if (selectedTerm) {
      crumbs.push({ label: selectedTerm.title });
    }

    return crumbs;
  }, [activeTab, onChangeTab, onSelectBucket, searchQuery, selectedBucket, selectedTerm]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch (error) {
      console.error("Unable to copy link", error);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/70 px-4 py-3 shadow-inner shadow-slate-950/40">
      <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.onClick ? (
              <button
                className="text-slate-400 transition hover:text-slate-100"
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ) : (
              <span className="text-slate-100">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <ChevronRightIcon className="h-3.5 w-3.5 text-slate-600" />
            )}
          </div>
        ))}
      </nav>
      <button
        className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-emerald-400 hover:text-white"
        onClick={handleCopyLink}
      >
        <CopyIcon className="h-4 w-4" />
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}

type TabNavProps = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
};

function DesktopTabs({ activeTab, onChange }: TabNavProps) {
  return (
    <div className="hidden rounded-3xl border border-slate-800/60 bg-slate-900/70 p-2 shadow-inner shadow-slate-950/40 md:flex md:items-center md:gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
            activeTab === tab.id
              ? "bg-slate-800 text-white shadow-lg shadow-emerald-500/10"
              : "text-slate-400 hover:text-slate-100",
          )}
          onClick={() => onChange(tab.id)}
        >
          <TabIcon id={tab.id} className="h-5 w-5" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">{tab.label}</p>
            <p className="text-xs text-current/80">{tab.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function BottomNav({ activeTab, onChange }: TabNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-900 bg-slate-950/95 px-6 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-wide transition",
              activeTab === tab.id
                ? "text-emerald-300"
                : "text-slate-500 hover:text-slate-100",
            )}
            onClick={() => onChange(tab.id)}
          >
            <TabIcon id={tab.id} className="h-6 w-6" />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

type TabIconProps = {
  id: TabId;
  className?: string;
};

function TabIcon({ id, className }: TabIconProps) {
  switch (id) {
    case "home":
      return <HomeIcon className={className} />;
    case "categories":
      return <GridIcon className={className} />;
    case "search":
      return <SearchIcon className={className} />;
    default:
      return null;
  }
}

function attachBucket(term: VocabularyTerm, bucket: VocabularyBucket) {
  return {
    ...term,
    bucketId: bucket.id,
    bucketTitle: bucket.title,
  } as TermWithBucket;
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x={3} y={3} width={7.5} height={7.5} rx={1.5} />
      <rect x={13.5} y={3} width={7.5} height={7.5} rx={1.5} />
      <rect x={3} y={13.5} width={7.5} height={7.5} rx={1.5} />
      <rect x={13.5} y={13.5} width={7.5} height={7.5} rx={1.5} />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx={11} cy={11} r={6} />
      <path d="M20 20l-4.35-4.35" />
    </svg>
  );
}

function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x={9} y={9} width={12} height={12} rx={2} />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
