# Vibe Guide

A plain-English guide that turns "vibe coding" into confident shipping for
**founders and makers who build real products with AI but aren't engineers.**
It gives you the words, prompts, and habits to make good technical calls and to
communicate clearly with developers and AI assistants — without a
computer-science background.

## The journey

Content is organized into page types that follow the founder/maker path:

1. **Speak the Language** — decode the dev words so you can prompt clearly.
2. **Build with AI** — drive AI coding tools well and trust what you ship.
3. **When It Breaks** — read errors, reproduce them, and fix them calmly.
4. **Ship It Live** — go from "works on my screen" to live on the internet, safely.
5. **Make a Page That Converts** — the fundamentals of a landing page that earns the click.

Each page type exposes three sections:

- **AI Prompts** — paste-ready prompts that channel an approachable expert.
- **Vocabulary** — the words a founder needs, each defined in plain English.
- **Principles** — the core habits that keep building with AI safe and sane.

## Content lives in data, not code

All user-facing content is JSON in `data/`, never hardcoded in components:

- `data/page-types.json` — the page types with their `prompts` and `principles`,
  each linked to a vocabulary bucket via `vocabularyBucketId`.
- `data/vocab.json` — `buckets[]`, each a list of vocabulary `terms`.
- `data/people.json` — the experts that prompts channel; a name matching a
  `people` entry auto-links to a profile anywhere in the text.

Routing is generic over `data/`
(`app/[pageTypeId]/{prompts,vocabulary,principles}`), so **adding a page type is
a data change, not a code change.** `lib/data.ts` holds the types and lookups.

See [`CLAUDE.md`](./CLAUDE.md) for the full audience definition and content
conventions.

## Tech

Next.js (App Router, static export) + React + Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Before you push

```bash
npm run build
```

The build is the gate — run it (and `npm run lint`) before pushing.
