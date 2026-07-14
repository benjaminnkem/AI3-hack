# Recommended Agent Skills and MCP Setup for ProofMesh

No MCP server is mandatory to implement ProofMesh. The coding agents already have the most important resource: the local repository plus the detailed PRD. Add only tools that improve documentation retrieval or browser validation. Too many MCP tools can distract the agent and increase risk.

---

## 1. Repository Instruction Files

These are more important than adding many MCP servers.

### For Codex: `AGENTS.md`

Create a root `AGENTS.md` that says:

- Read `docs/PROOFMESH_PRD.md` before implementation.
- Preserve the existing Turborepo, package manager, and app boundaries.
- All LLM inference must use Gonka Router.
- Tavily is retrieval only.
- Base Sepolia is the attestation network.
- Never commit secrets.
- Run lint, typecheck, tests, and build before reporting completion.
- Report environment variables and exact commands.

Codex supports project instructions through `AGENTS.md` and can use reusable agent skills, but a custom skill is not required for this two-day build.

### For Claude Code: `CLAUDE.md`

Create a root `CLAUDE.md` with the same constraints and references. Claude Code also supports repository skills, but a focused `CLAUDE.md` plus the PRD and one-shot prompt is sufficient.

Do not duplicate the entire PRD in these files. Link to it and state the non-negotiable rules.

---

## 2. Playwright MCP — Recommended

Purpose: let the coding agent open the running web app, inspect accessibility structure, click through the verification flow, check mobile layouts, and catch console/network errors.

Official package:

```text
@playwright/mcp@latest
```

### Claude Code

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Headless alternative:

```bash
claude mcp add playwright -- npx @playwright/mcp@latest --headless
```

### Codex

```bash
codex mcp add playwright -- npx -y @playwright/mcp@latest
codex mcp list
```

Or project-scoped `.codex/config.toml`:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
startup_timeout_sec = 20
tool_timeout_sec = 120
enabled = true
default_tools_approval_mode = "prompt"
```

Use Playwright MCP for development validation. Keep ordinary committed Playwright E2E tests as the reproducible CI source of truth.

---

## 3. Tavily MCP — Recommended for the Coding Agent, Separate from Runtime

Purpose: allow Codex/Claude to read current official documentation and retrieve pages while implementing. This does not replace the backend’s `@tavily/core` runtime integration.

Remote server:

```text
https://mcp.tavily.com/mcp/
```

### Claude Code with OAuth

```bash
claude mcp add tavily-remote-mcp --transport http https://mcp.tavily.com/mcp/
```

Start a new Claude session and complete the OAuth flow.

### Codex project configuration

Add to `.codex/config.toml`:

```toml
[mcp_servers.tavily]
url = "https://mcp.tavily.com/mcp/"
auth = "oauth"
tool_timeout_sec = 120
enabled = true
default_tools_approval_mode = "prompt"
```

Then:

```bash
codex mcp login tavily
codex mcp list
```

The coding agent should still prioritize these official URLs:

- `https://gonkarouter.io/docs`
- `https://gonkarouter.io/models`
- `https://docs.tavily.com/`
- `https://docs.base.org/`
- `https://hardhat.org/docs/`

---

## 4. Context7 — Optional

Context7 can provide current library documentation for NestJS, Next.js, TypeORM, Hardhat, Viem/Ethers, and TanStack Query. It is useful when the coding agent lacks web browsing, but it is not required when Tavily/web access is available.

### Codex

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
```

### Claude Code

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

Tell the agent to prefer primary official documentation over generated examples.

---

## 5. GitHub MCP — Optional

Use GitHub MCP only when the agent needs to read issues, inspect remote pull requests, or publish a PR. Local `git` is enough for implementation.

Do not grant broad GitHub write permission merely to build the project. Use the smallest permissions possible.

---

## 6. Base MCP — Not Needed for This Build

Base provides an MCP that can give an AI assistant wallet abilities. ProofMesh does not need it.

Use normal Hardhat/Foundry deployment scripts and a dedicated Base Sepolia private key in the local contract/backend environment. This is easier to reproduce and safer than giving the coding agent general wallet tools.

Never provide an MCP server or coding agent with a wallet containing mainnet assets.

---

## 7. Gonka as the Coding Model — Optional

Gonka’s documentation explains how Claude Code can itself be routed through Gonka Router by setting:

- `ANTHROPIC_BASE_URL=https://api.gonkarouter.io`
- `ANTHROPIC_AUTH_TOKEN=<Gonka key>`
- `ANTHROPIC_MODEL=moonshotai/Kimi-K2.6`
- `ANTHROPIC_SMALL_FAST_MODEL=moonshotai/Kimi-K2.6`
- `DISABLE_PROMPT_CACHING=1`

This is optional and separate from the ProofMesh runtime integration. Do not accidentally replace an existing Claude OAuth session unless that is intentional. The official Gonka docs recommend an isolated `HOME` when routing Claude Code through Gonka.

---

## 8. Minimal Recommended Set

For this hackathon, use:

1. Root `AGENTS.md` and/or `CLAUDE.md` referencing the PRD.
2. Playwright MCP for UI inspection.
3. Tavily MCP for current docs/search.
4. Normal local shell/git/database access.

Skip Base MCP, database MCP, blockchain-wallet MCP, and broad cloud-control MCP servers. The application’s own tests and scripts should remain the reproducible way to validate the system.
