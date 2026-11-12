# SUHAS AI — Independent Reusable Module

## Canonical implementation
- Canonical page/runtime: `/ai.html` (existing complete implementation; preserve it until a tested extraction is ready).
- Canonical backend: Supabase Edge Function `ai-assistant`.
- Conversation persistence: `suhas_ai_conversations` and `suhas_ai_messages`, protected by the existing user-scoped RLS policies.
- Shared services/config: existing `assets/config.js`, `assets/auth.js`, Supabase client and current project configuration.

## Reuse contract
Every SUHAS AI placement must open the same canonical implementation and backend. Do not fork the prompt logic, chat UI, history logic, attachment handling, voice handlers, or provider configuration into separate copies. This keeps every placement behaviorally identical and lets one tested update apply everywhere.

Current placements found in the repository:
- Job page: `jobs.html` → `ai.html?mode=jobs`.
- SUHAS GROUP app launcher: `app.html` → `ai.html`.

Future SUHAS-MAX placement:
- Add a SUHAS AI tile/button that opens the canonical `/ai.html` route (optionally with a placement query parameter for context only).
- Do not embed a second independent AI implementation or duplicate the backend.
- Keep SUHAS AI's product identity and existing automation/conversation behavior unchanged.

## Protected behavior
Preserve the current AI page's authentication gate, chat history, streaming responses, attachment parsing and preview, voice recording, live voice turn-taking, language handling, career/job guidance, Supabase request contract, and existing Edge Function behavior. No prompt/model/backend/schema changes are part of the module-boundary task unless separately requested and tested.

## Completion gates
1. Inventory every current SUHAS AI entry point and dependency.
2. Establish the canonical module boundary without changing user-visible behavior.
3. Keep compatibility with existing `/ai.html` links.
4. Add the SUHAS-MAX entry point only when its destination menu is ready.
5. Static/syntax checks, authenticated chat/history/attachment/voice tests, and navigation regression checks.
6. Update `DEVELOPMENT_CHECKPOINT.md` after each committed increment.
7. Do not deploy or call this complete until Cloudflare deployment and live behavior are verified.
