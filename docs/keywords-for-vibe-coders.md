# Keywords for Vibe Coders (Non-Devs)

A running list of words, terms, and phrases that are genuinely useful for people
who build with AI but don't come from a traditional engineering background. The
goal: capture the vocabulary that unlocks clearer prompts, better tool choices,
and smoother conversations with developers and AI assistants.

> **How to use this doc:** Add anything you hear that made you go "oh, *that's*
> what that means." Keep entries short and plain-spoken. Promote the strongest
> ones into the app's `data/vocab.json` once they're proven useful.

## Status legend

- 🌱 **Idea** — just captured, not yet vetted
- ✅ **Keeper** — confirmed useful, ready to promote into the guide
- 🚫 **Cut** — considered and dropped (note why)

---

## Candidate keywords

| Keyword | Plain-English meaning | Why it helps a vibe coder | Status |
| --- | --- | --- | --- |
| Repository (repo) | The folder/home for all your project's code and history | Lets you talk about "where the code lives" with devs and AI | 🌱 |
| Commit | A saved snapshot of your changes with a short note | Helps you undo safely and explain what you changed | 🌱 |
| Branch | A parallel copy of the project to try ideas without breaking the main one | Encourages experimenting without fear | 🌱 |
| Pull request (PR) | A proposal to merge your changes, with room for review | The unit of "here's my change, please check it" | 🌱 |
| Environment variable | A setting/secret stored outside the code (like an API key) | Keeps passwords out of your code and out of trouble | 🌱 |
| API | A doorway one app uses to talk to another | Most "connect X to Y" tasks come down to an API | 🌱 |
| Endpoint | A specific address/URL an API responds to | Lets you be precise about *which* part of a service you mean | 🌱 |
| Dependency | An outside package your project relies on | Explains why things "break after an update" | 🌱 |
| Deploy / ship | Push your project live so others can use it | The difference between "works on my screen" and "real" | 🌱 |
| Localhost | Your project running privately on your own machine | Where you test before deploying | 🌱 |
| Frontend / backend | The part users see vs. the part that runs behind the scenes | Helps you point AI at the right layer | 🌱 |
| State | The current data/condition an app is holding in memory | Names the cause of "why did it forget what I did?" | 🌱 |
| Refactor | Rewrite code to be cleaner without changing what it does | A safe ask: "refactor this, keep behavior identical" | 🌱 |
| Edge case | An unusual input/situation that breaks normal assumptions | Prompts you to ask AI "what edge cases am I missing?" | 🌱 |
| Idempotent | Running it again has the same effect as running it once | Useful when asking "is it safe to retry this?" | 🌱 |

---

## Phrases worth teaching

Short prompt-ready phrases that consistently get better results from an AI
assistant.

- "Explain this like I'm not a developer, then show the code."
- "What are the edge cases I'm not thinking about?"
- "Refactor for readability — don't change the behavior."
- "What's the smallest change that fixes this?"
- "Walk me through what this does line by line."

---

## Backlog / to research

- Terms specific to no-code and low-code tools
- AI-specific vocabulary (context window, token, hallucination, RAG, agent)
- Common error-message words that scare non-devs (stack trace, null, 500)
