"use client";

import { Fragment, useMemo } from "react";

import { people } from "@/lib/data";

import { usePerson } from "./PersonProvider";

const PERSON_NAME_TO_ID = new Map(people.map((person) => [person.name, person.id]));
const PERSON_NAME_REGEX_SOURCE = Array.from(PERSON_NAME_TO_ID.keys())
  .sort((a, b) => b.length - a.length)
  .map((name) => escapeRegExp(name))
  .join("|");

type Segment =
  | { type: "text"; value: string }
  | { type: "person"; value: string; personId: string };

export default function PeopleAwareText({ text }: { text?: string }) {
  const { openPerson } = usePerson();

  const segments = useMemo(() => splitTextIntoSegments(text), [text]);

  if (text === undefined || text === null) {
    return null;
  }

  return (
    <span>
      {segments.map((segment, index) =>
        segment.type === "text" ? (
          <Fragment key={`text-${index}`}>{segment.value}</Fragment>
        ) : (
          <button
            type="button"
            key={`person-${segment.personId}-${index}`}
            className="inline font-semibold text-emerald-300 underline decoration-dotted underline-offset-4 transition hover:text-emerald-200"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openPerson(segment.personId);
            }}
          >
            {segment.value}
          </button>
        ),
      )}
    </span>
  );
}

function splitTextIntoSegments(text?: string): Segment[] {
  if (!text || !PERSON_NAME_REGEX_SOURCE) {
    return text ? [{ type: "text", value: text }] : [];
  }

  const regex = new RegExp(PERSON_NAME_REGEX_SOURCE, "g");
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, matchIndex),
      });
    }

    const matchedName = match[0];
    const personId = PERSON_NAME_TO_ID.get(matchedName);

    if (personId) {
      segments.push({
        type: "person",
        value: matchedName,
        personId,
      });
    } else {
      segments.push({
        type: "text",
        value: matchedName,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return segments;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
