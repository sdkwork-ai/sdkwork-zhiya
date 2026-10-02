# sdkwork-zhiya Documentation

Documentation canon for `sdkwork-zhiya` — Zhiya (知鸭), the AI-native family
education and activity platform (`DOCUMENTATION_SPEC.md`).

## Canon

| Document | Audience | Purpose |
| --- | --- | --- |
| [PRD](product/prd/PRD.md) | Product / Engineering / QA | Product canon: positioning, users, MVP boundary (P0/P1/P2), flows, data objects, success metrics. |
| [TECH_ARCHITECTURE](architecture/tech/TECH_ARCHITECTURE.md) | Engineering | Technical canon: surfaces, technology choices, package topology, service/mock policy, verification. |

## Audience routing

| If you are… | Start with |
| --- | --- |
| Product manager | [PRD](product/prd/PRD.md) → [roadmap](product/roadmap/README.md) → [requirements](product/requirements/README.md) |
| Architect | [TECH_ARCHITECTURE](architecture/tech/TECH_ARCHITECTURE.md) → [decisions](architecture/decisions/README.md) |
| Developer | [TECH_ARCHITECTURE](architecture/tech/TECH_ARCHITECTURE.md) → [developer guides](guides/developer/README.md) → repo `AGENTS.md` |
| Operator | [operator guides](guides/operator/README.md) → [runbooks](runbooks/README.md) |
| Integrator | [integrator guides](guides/integrator/README.md) |
| Agent | repo `AGENTS.md` → `../sdkwork-specs/README.md` task rows |

## Layout

| Area | Content |
| --- | --- |
| `product/prd/` | Product canon (PRD) and shards. |
| `product/requirements/` | REQ entries tracing PRD scope to implementation. |
| `product/roadmap/` | Phase plan (P0 milestone → P1/P2). |
| `architecture/tech/` | Technical canon and shards. |
| `architecture/decisions/` | ADRs (`ADR-*`). |
| `architecture/views/` | Diagrams and views. |
| `guides/` | Developer / operator / integrator guides. |
| `engineering/` | Plans and reviews. |
| `runbooks/`, `releases/`, `changelogs/`, `migrations/`, `domains/`, `archive/` | Operations and history (placeholders until populated). |

Verification: `node ../sdkwork-specs/tools/check-repository-docs-standard.mjs --root .`
