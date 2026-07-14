# Mesh Claude Code Instructions

The product source of truth is `docs/MESH_PRD.md`. Read it before implementation.

## Hard constraints

- Preserve the current Turborepo and package manager.
- Implement the task completely; do not stop at planning or scaffolding.
- All AI inference must go through Gonka Router.
- Confirm Gonka endpoint, model IDs, and request/response behavior from `https://gonkarouter.io/docs` and `https://gonkarouter.io/models`.
- Tavily is the live evidence retrieval layer only.
- Base Sepolia chain ID 84532 is the attestation network.
- No secrets in source control or browser-exposed environment variables.
- No fake production responses, silent requirement reduction, or unrelated features.
- Prefer simple, testable architecture over extra infrastructure.
- Run and fix lint, typecheck, tests, and builds for changed apps.

## Completion report

Always finish with:

1. What was implemented.
2. Important decisions.
3. Files changed.
4. Environment variables and how to obtain them.
5. Exact setup/run/test/deploy commands.
6. Commands actually run and results.
7. Manual external actions still required.
8. Honest limitations.
