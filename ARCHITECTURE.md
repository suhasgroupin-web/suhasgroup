# SUHAS Modular Isolation Architecture

Status: Foundation approved for incremental implementation
Default integration branch: main
Foundation branch: architecture/modular-isolation-foundation
Production hosting: Cloudflare Pages (suhasgroup.pages.dev)

## Non-negotiable isolation rules
1. Each independently navigable product/feature owns its HTML entry (or route), CSS, JavaScript, and tests where practical.
2. CSS must be namespaced under a feature root (for example `.smx-social`, `.sg-career`, `.smx-messenger`). Avoid broad selectors and global overrides.
3. JavaScript must use feature namespaces/modules; avoid adding globals. Shared behavior belongs only in an explicitly versioned shared module with documented consumers.
4. A feature must not directly edit another feature's files. Cross-feature changes require an explicit integration change and tests for both sides.
5. Preserve existing public URLs as compatibility entry points until replacement routes are verified. No mass moves or deletions.
6. Shared auth, Supabase client/config, session, storage and design tokens are platform contracts. Change them additively and run consumer regression checks.
7. Every control must retain its real handler and backend behavior. No placeholder replacement.
8. Feature branches are short-lived and scoped to one feature/module or one cross-cutting integration. Do not create permanent empty branches for every button; branch isolation is used for actual code changes.
9. Merge only after syntax/build checks, route checks, feature tests and adjacent-feature regression tests pass. Deployment is a separate approval/release step.
10. Each increment updates DEVELOPMENT_CHECKPOINT.md with commit, changed files, test evidence, risks and deployment state.

## Product boundaries

### SUHAS GROUP (corporate portal)
- Main Menu
- Job
- O5 INTL
- Career
  - Profile (corporate member profile)
  - Career content: government-related issues, Quality, departments, factories, Company Mirda, Company Own, Religion and existing related content
- Team
- Contact
- SUHAS MAX entry

### SUHAS MAX (separate product)
- Social
- SUHAS Messenger
- SUHAS AI
- Go to SG

Social subfeatures are to be split incrementally into independently scoped modules (feed/composer, profile, friends/requests/follows, groups, marketplace, stories/reels, notifications, settings, gaming, search/navigation). Messenger remains an independent page/module and uses the SUHAS-MAX identity/profile, not the corporate profile.

## Target directory layout (additive; legacy routes retained)
```
apps/
  suhas-group/
    main-menu/
    job/
    o5-intl/
    career/
      profile/
      career-content/
    team/
    contact/
  suhas-max/
    shell/
    social/
      feed/
      profile/
      friends/
      groups/
      marketplace/
      stories-reels/
      notifications/
      settings/
      gaming/
      navigation/
    messenger/
    ai/
    go-to-sg/
shared/
  auth/
  supabase/
  design-tokens/
  routing/
tests/
  routes/
  modules/
  regression/
```

## Migration strategy
- Phase 0: document boundaries, dependency rules, route inventory and baseline.
- Phase 1: isolate low-risk independent pages and Messenger assets without changing runtime behavior.
- Phase 2: establish SUHAS GROUP and SUHAS MAX shells and route contracts while retaining legacy URLs.
- Phase 3: decompose the large social page one bounded feature at a time. Extract CSS/JS only after tracing DOM selectors, event handlers, shared state and Supabase calls. Keep the old page as the integration entry during extraction.
- Phase 4: add automated syntax, route, control and regression checks.
- Phase 5: verify Cloudflare Pages preview and production separately before release.

## Required checks per change
- Parse every changed JavaScript file.
- Check all local links, script and stylesheet references.
- Verify the affected page and one neighboring page.
- Verify auth/session behavior for protected pages.
- Verify no data/schema/storage changes unless separately reviewed and backed by an additive migration.
- Record real-device/two-account checks as pending unless actually performed.

## Current baseline observations
- social.html is approximately 604 KB and contains extensive inline styles/scripts; it is the highest-risk extraction target.
- messenger.html, messenger.css and messenger.js are already separated.
- Several corporate pages already exist as individual HTML routes (job.html, o5-all-in-one.html, quality.html, departments.html, factories.html, religion.html, contact.html, etc.).
- Existing route names and backend integrations must be preserved during migration.
- main-menu.html must be verified as a route before assuming its current semantics.
