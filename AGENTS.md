# Mesh Agent Instructions

Read `docs/MESH_PRD.md` before making implementation decisions.

Non-negotiable rules:

- Preserve the existing Turborepo, package manager, app boundaries, and working conventions.
- Focus only on the app(s) named in the current task.
- Route every LLM inference through Gonka Router.
- Use exact live Gonka model IDs and API behavior from official Gonka documentation; never invent provider fields.
- Use Tavily only for web search and URL extraction, not as an LLM provider.
- Use Base Sepolia, chain ID 84532, for the attestation registry.
- Keep all secrets server-side and never commit `.env` files or real keys.
- Do not add unrelated infrastructure or features.
- Implement real behavior; production code must not use fake AI responses.
- Validate external structured outputs and fail honestly rather than inventing successful results.
- Run formatting, lint, typecheck, tests, and production builds relevant to changed apps.
- Do not report a command as passing unless it was run.
- At completion, explain files changed, architecture, environment variables, setup commands, tests run, external actions required, and remaining limitations.
