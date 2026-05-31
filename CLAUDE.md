# Vibe Guide

## Who this is for (read this first)

**Core audience: founders and makers who build real products with AI but are not
engineers.** They ship with AI coding tools, need to make good technical calls,
and need to communicate clearly with developers and AI assistants — without a
computer-science background.

Every piece of content is written for that person. Concretely:

- **Define jargon the moment it appears.** Never assume the reader knows a term.
- **Plain language over precision-flexing.** Say "the part users see" before
  "the frontend," then name it.
- **Lead with the decision or action**, not the theory. A founder wants to know
  what to do and what to check.
- **Respect their intelligence, not their vocabulary.** They are smart and
  capable; they just don't speak dev yet.

If a sentence would only land for someone who already codes, rewrite it.

## What the app is

A guide that turns "vibe coding" into confident shipping for non-engineers. It is
organized into **page types** that follow the founder/maker journey (understand
the words → build with AI → debug when it breaks → ship it live). Each page type
exposes three sections:

- **AI Prompts** — paste-ready prompts that channel an approachable expert.
- **Vocabulary** — the words a founder needs, each defined in plain English.
- **Principles** — the core habits that keep building with AI safe and sane.

## Tech

Next.js (App Router, static export) + React + Tailwind. Content lives in JSON,
not in components — see below.

## Where content lives

All user-facing content is data, edited in `data/`, never hardcoded in components:

- `data/page-types.json` — the page types and their `prompts` + `principles`,
  each linked to a vocabulary bucket via `vocabularyBucketId`.
- `data/vocab.json` — `buckets[]`, each a list of vocabulary `terms`. A term has
  `id`, `title`, `shortDescription`, `definition`, `whenToUse`, `aiPhrases[]`,
  and optional `examples[]`.
- `data/people.json` — the experts personas channel. A persona's `personId`
  links here; names matching a `people` entry auto-link to a profile in any text.

Routing is generic over `data/` (`app/[pageTypeId]/{prompts,vocabulary,principles}`),
so adding a page type is a data change, not a code change. `lib/data.ts` holds the
types and lookups.

## Conventions

- Add content by **appending to the JSON** so existing entries stay untouched
  (keeps diffs clean). Keep the 2-space indentation.
- `id`s are kebab-case and stable — they appear in URLs.
- When you add a persona to a page type's `prompts`, add a matching `people`
  entry so the name links to a profile.
- Keep UI copy audience-appropriate too: the home cards and section headings
  should describe the founder/maker value, not internal jargon.

## Working agreement

- Develop on the feature branch you were given; commit small and push.
- Run `npm run build` before pushing — the build is the gate.
