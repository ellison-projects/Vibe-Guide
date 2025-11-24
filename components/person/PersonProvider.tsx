"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getPersonById, type Person } from "@/lib/data";

type PersonContextValue = {
  openPerson: (personId: string) => void;
  closePerson: () => void;
};

const PersonContext = createContext<PersonContextValue | undefined>(undefined);

export function PersonProvider({ children }: { children: ReactNode }) {
  const [activePersonId, setActivePersonId] = useState<string | null>(null);

  const activePerson = useMemo(
    () => getPersonById(activePersonId ?? undefined),
    [activePersonId],
  );

  const openPerson = useCallback((personId: string) => {
    setActivePersonId(personId);
  }, []);

  const closePerson = useCallback(() => {
    setActivePersonId(null);
  }, []);

  return (
    <PersonContext.Provider value={{ openPerson, closePerson }}>
      {children}
      <PersonInfoModal person={activePerson} onClose={closePerson} />
    </PersonContext.Provider>
  );
}

export function usePerson() {
  const context = useContext(PersonContext);
  if (!context) {
    throw new Error("usePerson must be used within a PersonProvider");
  }
  return context;
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
