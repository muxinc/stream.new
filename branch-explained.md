# Overview

Migrate from the `@mux/ai` npm package (in-process SDK calls) to the hosted Mux Robots API (`api.mux.com/robots/v1`) for video moderation, summarization, and question-answering. Simplifies moderation from dual-provider (OpenAI + Hive) to single-provider. Removes the `@mux/ai` dependency entirely.

# What was changed

- **`lib/robots-client.ts`** (new) — HTTP client for the Robots API. Creates moderation, summarize, and ask-questions jobs via POST, polls job status via GET. Uses a `fetchFn` parameter to work within the workflow sandbox (no `Buffer` or global `fetch` available).
- **`types/robots.ts`** (new) — Type definitions for Robots API responses (both camelCase app types and snake_case API types with normalization).
- **`workflows/process-mux-ai.ts`** — Replaced `@mux/ai/workflows` SDK calls (`getModerationScores`, `getSummaryAndTags`, `askQuestions`) with Robots API HTTP calls + polling. Uses `fetch` from the `workflow` package. Jobs are created then polled every 5s until completion. Summarize and ask-questions jobs are started in parallel but polled sequentially (concurrent polling breaks workflow replay).
- **`lib/moderation-action.ts`** — Simplified `checkAndAutoDelete` from dual `openaiResult`/`hiveResult` params to single `moderationResult`. Switched from `got` to `fetch` for Airtable calls.
- **`lib/slack-notifier.ts`** — Single moderation result instead of separate OpenAI/Hive fields. Switched from `got` to `fetch`. Updated type imports.
- **`app/api/webhooks/mux-ai/` → `app/api/webhooks/mux/`** — Renamed route (no logic changes). Still handles `video.asset.ready` and caption track webhooks.
- **`package.json`** — Removed `@mux/ai` dependency.
- **`.env.local.example`** — Removed `OPENAI_API_KEY` and `HIVE_API_KEY` (Robots handles these server-side).
- **Test files** — Updated to match new single-result signatures; removed Hive-specific test variants.

# Suggested review order

1. `types/robots.ts` — understand the new type shapes
2. `lib/robots-client.ts` — the HTTP client and `fetchFn` pattern for workflow compatibility
3. `workflows/process-mux-ai.ts` — the core workflow rewrite (polling loop, sequential polling for replay safety)
4. `lib/moderation-action.ts` — simplified from dual to single moderation
5. `lib/slack-notifier.ts` — type changes + `got` → `fetch`
6. `lib/moderation-action.spec.ts` + `lib/slack-notifier.spec.ts` — test updates
7. `package.json` + `.env.local.example` — dependency and env cleanup
