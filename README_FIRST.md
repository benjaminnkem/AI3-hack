# Mesh Builder Pack

Use the files in this order:

1. Copy `MESH_PRD.md` into your repository as `docs/MESH_PRD.md`.
2. Optionally create short root `AGENTS.md` and `CLAUDE.md` files using the guidance in `AGENT_SKILLS_AND_MCP.md`.
3. From repository root, paste `BACKEND_CONTRACTS_ONE_SHOT_PROMPT.md` into Codex or Claude Code.
4. Review its completion report, set required environment variables, run migrations, deploy the Ethereum Sepolia contract, and confirm the backend smoke flow.
5. Paste `FRONTEND_ONE_SHOT_PROMPT.md` into a fresh agent session.
6. Follow `ENVIRONMENT_AND_TESTING_GUIDE.md` to test the complete local and deployed flow.

The backend/contracts prompt should be run before the frontend prompt because the frontend is instructed to inspect the actual Swagger/OpenAPI contract instead of inventing API fields.
