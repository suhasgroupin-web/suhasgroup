# SUHAS GROUP + SUHAS-MAX Integration Registry

Status: Initial audit baseline (2026-11-11)
Repository: suhasgroupin-web/suhasgroup
Source of truth: GitHub `main` (production changes require review and verification)
Working branch: `chore/integration-registry-audit`

## Product architecture

- **SUHAS GROUP** is the corporate/business platform: garments operations, HR, finance, inventory, CRM, ERP, reporting, management dashboards and internal automation.
- **SUHAS-MAX** is the social platform: feed, profiles, friends, Messenger, stories, reels, groups, marketplace, notifications, privacy and account security.
- Both products may share authentication, database infrastructure, observability and integration adapters, but must retain separate navigation, permissions, data boundaries and user experiences.
- Existing GitHub repository and Supabase project remain authoritative. Cloudflare Pages is the sole production frontend host. Vercel is retired and must not be used for new deployments.
- Prefer standards-based, portable components: PostgreSQL, REST/HTTP APIs, webhooks, OAuth 2.0, OpenAPI, Docker/OCI, and documented environment configuration. Do not couple core business logic to a single proprietary AI provider.

## Mandatory safety and acceptance rules

1. No service is described as unlimited unless its actual license, infrastructure and resource constraints support that claim. Self-hosted software removes many vendor plan quotas, not hardware, bandwidth, API-provider or operational limits.
2. No secrets, access tokens, service-role keys, passwords or private customer data may be committed to Git.
3. Never execute unknown install scripts, third-party workflow templates, marketplace actions or container images without inspecting source, publisher, permissions, dependencies and license.
4. Pin dependencies/actions/images to reviewed versions or immutable digests where practical; enable automated security scanning and update review.
5. Every integration needs a documented owner, purpose, data flow, permissions, license, hosting requirement, cost/usage limits, secret names (never values), threat notes, rollback and test evidence.
6. Add integrations as optional adapters. Core app functionality must continue if an external automation, AI, video or analytics provider is unavailable.
7. No destructive schema, data, storage, route, or deployment changes. Use additive migrations and reversible small commits.
8. Do not activate paid plans, paid API calls, public OAuth applications, external messaging campaigns, DNS changes or data exports without the relevant account authorization.
9. Do not collect or transmit social messages, member profiles, employee or financial data to third parties unless the data purpose, consent, retention, access controls and legal basis are reviewed.
10. Do not promise Facebook/Meta integration, LinkedIn automation, WhatsApp delivery, payments, AI generation or ad revenue until provider approval, credentials and end-to-end tests exist.

## Existing repository integration baseline (observed)

| Component | Existing evidence | Current classification |
|---|---|---|
| GitHub | Main repository and Actions workflows | Primary source of truth |
| Supabase | Existing project, Auth, PostgreSQL, RLS, Storage and Edge Function | Existing backend; preserve |
| Vercel | Historical deployment records only | Retired; no production builds or deploys |
| Cloudflare Pages | Production static frontend host | Primary production target; GitHub Actions workflow deploys `main` to project `suhasgroup` |
| GitHub Pages | Existing deploy workflow | Legacy/secondary output; review commercial suitability before relying on it |
| CodeQL | Existing workflow | Security scanning |
| Site quality checks | Existing workflow | Static validation |
| Datadog Synthetics | Existing workflow | External monitoring; verify account/secret and plan constraints |
| Supabase Edge Functions | Existing workflow for ai-assistant | Backend function deployment; verify credentials and AI provider quota |
| Gemini | Existing workflow expects a Gemini API key and configures a model | Provider dependency; quota/terms apply; do not call unlimited |
| TinyFish | Connected tool available to development operator | Use for permitted browser research/workflows; not a production runtime dependency |
| HeyGen / fal | Connected creative tools | Optional content production; plan/API quotas and rights review required |

## Candidate technology register

These are candidates, not claims of installation or production activation.

| Technology | Intended SUHAS use | License / operating model | Decision |
|---|---|---|---|
| Activepieces Community Edition | Internal workflow automation, webhooks and AI workflows | Core MIT; enterprise/cloud-only areas have separate commercial licensing; self-host requires compute and dependencies | Preferred pilot after server/hosting is available; use only MIT-covered core and reviewed pieces |
| Node-RED | Event-driven integrations, IoT/factory signals, internal API orchestration | Apache-2.0 core; third-party nodes may have separate licenses | Approved candidate; self-host required for durable production use |
| Coolify | Portable deployment control plane and self-hosted alternative to managed PaaS | Apache-2.0; requires owned/managed server infrastructure | Future VPS foundation; cannot operate without a server |
| ERPNext | Corporate ERP: accounts, HR, inventory, purchasing, manufacturing workflows | GPLv3; trademark and distribution obligations must be respected | Future evaluation; isolate deployment and review GPL/commercial obligations before embedding or distributing |
| Huginn | Event monitoring and agent-based automation | License and maintenance status must be rechecked before adoption | Research-only; not approved for production yet |
| n8n | Advanced internal workflows | Sustainable Use License; use cases and embedding/white-label restrictions apply | Do not embed as a customer-facing workflow builder without legal/license review |
| Metabase | Internal analytics and management reporting | Open-source edition and paid editions differ; verify edition license and deployment model | Candidate for internal reporting after data access review |
| Appsmith | Internal admin and operations tools | Edition-specific license terms | Candidate; verify current edition license before adoption |
| OpenTelemetry | Portable logs, metrics and traces instrumentation | Apache-2.0 ecosystem | Preferred instrumentation standard; adopt incrementally |
| PostgreSQL | Portable relational data foundation | PostgreSQL License | Existing Supabase PostgreSQL remains primary; no duplicate database now |
| Docker / OCI | Portable packaging for future self-hosting | Open standards; individual images retain their own licenses | Adopt only with pinned, scanned images and server capacity |
| OpenAI / Gemini / other hosted AI APIs | Optional AI capabilities | Provider-specific terms, pricing and rate limits | Adapter-based only; never assume free or unlimited |

## Hosting reality and deployment policy

- There is currently no user-provided VPS/server. Do not attempt to deploy always-on self-hosted services to GitHub Pages or static Cloudflare Pages.
- GitHub Actions runners are temporary CI workers, not a permanent application server.
- Cloudflare Workers/Pages and Supabase Edge Functions are useful serverless execution options but have plan quotas and runtime constraints.
- A self-hosted service requires persistent compute, storage, backups, patching, monitoring and secure network exposure. A free trial or free tier is not an unlimited production host.
- Use Cloudflare Pages as the only production frontend target; confirm the deployment workflow and production URL after every release.
- Review GitHub Pages workflow separately: GitHub Pages is not the default production host for a commercial SaaS application.
- Do not duplicate the production Supabase database or migrate user data as part of this registry task.

## Integration onboarding checklist

For each proposed integration:
- [ ] Confirm official source repository and publisher.
- [ ] Read exact license and edition restrictions.
- [ ] Review security policy, release activity, dependency and container provenance.
- [ ] Identify whether it is library, CI tool, hosted API, browser agent, or always-on server.
- [ ] Record free-tier quotas, rate limits, data retention and paid triggers.
- [ ] Define data flow, scopes, RLS/service-role boundaries and consent.
- [ ] Define secret names only; store values in GitHub/Supabase/host secret manager, never source files.
- [ ] Run in isolated test/staging environment with synthetic data.
- [ ] Add health checks, failure handling, audit logs and a kill switch.
- [ ] Test failure isolation and rollback.
- [ ] Update this registry and DEVELOPMENT_CHECKPOINT.md with evidence before production activation.

## Next implementation increments

1. Finish deployment and workflow inventory; inspect repository workflow run statuses and required secrets by workflow outcome, without exposing secret values.
2. Add automated dependency and secret scanning where compatible with existing CodeQL/security workflows; avoid duplicate or noisy checks.
3. Define a portable integration adapter contract (configuration schema, health check, timeout, retries, audit events, permissions).
4. Prototype one non-production integration using synthetic data only; Activepieces or Node-RED is preferred only after a persistent host is available.
5. Design the shared corporate/social module boundary and role/permission matrix before integrating ERP or automation services.
6. Revisit VPS/self-hosted deployment once infrastructure exists; then evaluate Coolify + PostgreSQL/Redis + Activepieces/Node-RED + ERPNext as separate services.

## Current status

- Registry document: created on an isolated branch for review.
- Production application: unchanged by this increment.
- Database and user data: unchanged.
- External integrations: none newly connected or activated by this document.
- Deployment/live behavior: not changed or verified by this increment.
