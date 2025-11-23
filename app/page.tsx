"use client";

import { useEffect, useMemo, useState, type ReactNode, type SVGProps } from "react";
import {
  allTerms,
  buckets,
  type TermWithBucket,
  type VocabularyBucket,
  type VocabularyTerm,
} from "@/lib/data";
import { cn } from "@/lib/utils";

type TabId = "home" | "categories" | "search";

const tabs: Array<{ id: TabId; label: string; description: string }> = [
  { id: "home", label: "Home", description: "Overview & recents" },
  { id: "categories", label: "Categories", description: "Explore buckets" },
  { id: "search", label: "Search", description: "Find specific terms" },
];

const suggestedTerms = allTerms.slice(0, 6);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [selectedBucketId, setSelectedBucketId] = useState(
    buckets[0]?.id ?? "",
  );
  const [selectedTerm, setSelectedTerm] = useState<TermWithBucket | null>(null);
  const [recentTerms, setRecentTerms] = useState<TermWithBucket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedBucket =
    buckets.find((bucket) => bucket.id === selectedBucketId) ?? buckets[0];

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return allTerms.filter((term) => {
      const haystack = `${term.title} ${term.shortDescription} ${term.definition} ${term.whenToUse} ${term.bucketTitle}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery]);

  const handleSelectBucket = (bucketId: string) => {
    setSelectedBucketId(bucketId);
    setActiveTab("categories");
  };

  const handleSelectTerm = (term: TermWithBucket) => {
    setSelectedTerm(term);
    setRecentTerms((prev) => {
      const filtered = prev.filter((item) => item.id !== term.id);
      return [term, ...filtered].slice(0, 6);
    });
  };

  const handleClearTerm = () => setSelectedTerm(null);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-6 md:flex-row md:pb-10 lg:gap-10">
        <div className="flex-1 space-y-6">
          <DesktopTabs activeTab={activeTab} onChange={setActiveTab} />

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
              onSelectBucket={(bucketId) => setSelectedBucketId(bucketId)}
              onSelectTerm={handleSelectTerm}
            />
          )}

          {activeTab === "search" && (
            <SearchView
              query={searchQuery}
              results={searchResults}
              suggestions={suggestedTerms}
              onQueryChange={setSearchQuery}
              onSelectTerm={handleSelectTerm}
            />
          )}
        </div>

        <aside className="hidden w-full max-w-sm md:block lg:max-w-md">
          <TermDetailPanel
            term={selectedTerm}
            variant="desktop"
            onClose={handleClearTerm}
          />
        </aside>
      </div>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {selectedTerm && (
        <div className="md:hidden">
          <div
            aria-hidden
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
            onClick={handleClearTerm}
          />
          <TermDetailPanel
            term={selectedTerm}
            variant="mobile"
            onClose={handleClearTerm}
          />
        </div>
      )}
    </div>
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
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Start here
          </p>
          <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
            What are you working on?
          </h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {buckets.map((bucket) => (
            <button
              key={bucket.id}
              className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-left transition hover:border-slate-300 hover:bg-white"
              onClick={() => onSelectBucket(bucket.id)}
            >
              <p className="text-sm font-semibold text-slate-500">
                {bucket.title}
              </p>
              <p className="mt-2 text-base font-medium text-slate-900">
                {bucket.description}
              </p>
              <p className="mt-4 text-xs font-medium text-slate-500">
                {bucket.terms.length} vocabulary terms
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recently viewed
            </p>
            <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
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
          <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            You haven&apos;t opened any terms yet. Pick a bucket to start
            briefing your AI teammate.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recentTerms.map((term) => (
              <button
                key={term.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-left transition hover:border-slate-300 hover:bg-white"
                onClick={() => onSelectTerm(term)}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {term.bucketTitle}
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {term.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">
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
};

function BucketView({
  buckets,
  selectedBucket,
  onSelectBucket,
  onSelectTerm,
}: BucketViewProps) {
  const terms = selectedBucket.terms.map((term) =>
    attachBucket(term, selectedBucket),
  );

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Buckets
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          {selectedBucket.title}
        </h2>
        <p className="text-sm text-slate-600">{selectedBucket.description}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {buckets.map((bucket) => (
          <button
            key={bucket.id}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition",
              bucket.id === selectedBucket.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-900/30",
            )}
            onClick={() => onSelectBucket(bucket.id)}
          >
            {bucket.title}
          </button>
        ))}
      </div>

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
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Search the glossary
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Describe any design or UX fix
        </h2>
      </header>

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Try \u201cvisual hierarchy\u201d or \u201cemptystate copy\u201d"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-base shadow-inner focus:border-slate-900 focus:outline-none"
        />
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon className="h-5 w-5" />
        </div>
      </div>

      {showSuggestions && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">
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
          <p className="text-sm font-medium text-slate-500">
            {results.length} result{results.length === 1 ? "" : "s"} for
            &nbsp;
            <span className="text-slate-900">&ldquo;{trimmedQuery}&rdquo;</span>
          </p>
          {emptyState ? (
            <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No terms matched that phrase. Try searching for the outcome you
              want (for example: &ldquo;reduce clutter&rdquo; or
              &ldquo;onboarding copy&rdquo;).
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
      className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
      onClick={() => onSelect(term)}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {term.bucketTitle}
      </p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">{term.title}</p>
          <p className="mt-1 text-sm text-slate-600">
            {term.shortDescription}
          </p>
        </div>
        <ChevronRightIcon className="mt-1 h-4 w-4 text-slate-400 transition group-hover:text-slate-900" />
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
      className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-left transition hover:border-slate-300 hover:bg-white"
      onClick={() => onSelect(term)}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {term.bucketTitle}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-900">{term.title}</p>
      <p className="mt-1 text-sm text-slate-600">
        {term.shortDescription}
      </p>
    </button>
  );
}

type TermDetailPanelProps = {
  term: TermWithBucket | null;
  variant: "mobile" | "desktop";
  onClose: () => void;
};

function TermDetailPanel({ term, variant, onClose }: TermDetailPanelProps) {
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedPhrase) return;
    const timeout = setTimeout(() => setCopiedPhrase(null), 1500);
    return () => clearTimeout(timeout);
  }, [copiedPhrase]);

  const baseClasses =
    "bg-white shadow-xl transition-all duration-300 ease-out flex h-full flex-col overflow-y-auto";
  const variantClasses =
    variant === "mobile"
      ? "fixed inset-0 z-50 p-6"
      : "sticky top-6 rounded-3xl border border-slate-200 p-6";

  if (!term && variant === "mobile") {
    return null;
  }

  if (!term) {
    return (
      <div className={cn(baseClasses, variantClasses, "items-center justify-center text-center text-sm text-slate-500")}>
        <p>Select a term to open the detail coach.</p>
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
    <div
      className={cn(
        baseClasses,
        variantClasses,
        variant === "mobile"
          ? "rounded-none"
          : "rounded-3xl",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {term.bucketTitle}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            {term.title}
          </h2>
        </div>
        <button
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-4 text-sm text-slate-600">
        <DetailBlock label="Definition">{term.definition}</DetailBlock>
        <DetailBlock label="When to use it">{term.whenToUse}</DetailBlock>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          AI-ready phrases
        </p>
        <div className="space-y-3">
          {term.aiPhrases.map((phrase) => (
            <div
              key={phrase}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <p className="text-sm text-slate-900">{phrase}</p>
              <button
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-900"
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
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Examples
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            {term.examples.map((example) => (
              <li
                key={example}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
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

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm text-slate-700">{children}</p>
    </div>
  );
}

type TabNavProps = {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
};

function DesktopTabs({ activeTab, onChange }: TabNavProps) {
  return (
    <div className="hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm md:flex md:items-center md:gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
            activeTab === tab.id
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-900",
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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-6 py-3 shadow-2xl shadow-black/10 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-wide transition",
              activeTab === tab.id
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-900",
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
