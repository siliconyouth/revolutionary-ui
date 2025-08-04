# CODEX.md - Revolutionary UI Factory System Codex CLI Agent Integration

This file provides guidance for using the **Codex CLI** agent with the Revolutionary UI Factory System. It consolidates key contexts, summaries, commands, and best practices so Codex can effectively assist in development tasks.

## Critical Context Files

Before starting a Codex CLI session, load these core files:
- `AGENTS.md`               – Overview of agent workflows
- `CLAUDE.md`               – Project instructions for Claude (core principles, workflows)
- `CLAUDE_CONTEXT.md`       – Detailed technical context (patterns, conventions)
- `GEMINI.md`               – Gemini‑specific guidance (mirrors Claude context)
- `docs/AI_INTEGRATION.md`  – AI provider configuration and usage guide
- `docs/CONTEXT_ENGINEERING.md` – Best practices for structuring AI context
- `CHANGELOG.md`            – Chronological project release notes
- `CLI_DOCUMENTATION.md`    – Revolutionary UI CLI architecture and commands
- `README.md`               – High-level project overview and quick start

## Context Summaries

Below are concise summaries of each key context file so Codex has essential information even if external files evolve.

### AGENTS.md
- *Purpose*: Describes how to load and use agent contexts (Claude, Gemini, Codex, Mistral) including summaries of critical docs, environment setup, session commands, best practices, troubleshooting, and contributing updates.

### CLAUDE.md
- *Purpose*: Guidance for Claude Code with project overview, factory-first design principles, architecture diagrams, workflows, key commands, testing and publishing guidelines.

### CLAUDE_CONTEXT.md
- *Purpose*: Comprehensive technical reference: project identity, metrics, full tech stack, factory-pattern interfaces, configuration-driven examples, AI context schemas, plugin patterns, coding conventions, testing strategy, performance and security considerations.

### GEMINI.md
- *Purpose*: Gemini‑specific guide that mirrors CLAUDE.md/CLAUDE_CONTEXT.md, ensuring consistent instructions across AI agents.

### docs/AI_INTEGRATION.md
- *Purpose*: Instructions for configuring and using OpenAI, Anthropic, Google Gemini, and Mistral in code generation, streaming responses, context-aware prompts, suggestions, analysis, and framework transformations.

### docs/CONTEXT_ENGINEERING.md
- *Purpose*: Context engineering trade‑offs, structure, maintenance, layering context, token optimization, collaboration workflows, and measuring context effectiveness.

### CHANGELOG.md
- *Purpose*: Tracks project version history with features, fixes, and breaking changes for release management.

### CLI_DOCUMENTATION.md
- *Purpose*: Details on the Revolutionary UI CLI: automatic setup, AI-powered analysis, commands (analyze, setup, generate, list, info), core modules under `src/lib/factory/`, config catalogs, and build/release workflows.

### README.md
- *Purpose*: Top-level readme describing the ecosystem (package, CLI, website, VSCode extension), quick start, AI integration overview, premium features, and contributing guidelines.

## Environment Setup

Configure your API keys before invoking Codex:
```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_AI_API_KEY=...
export MISTRAL_API_KEY=...
```

## Starting a Codex CLI Session

Use the **codex** tool to begin with context loaded:
```bash
codex start \
  --context AGENTS.md \
  --context CLAUDE.md \
  --context CLAUDE_CONTEXT.md \
  --context GEMINI.md \
  --context docs/AI_INTEGRATION.md \
  --context docs/CONTEXT_ENGINEERING.md \
  --context CHANGELOG.md \
  --context CLI_DOCUMENTATION.md \
  --context README.md
```

## Quick Commands

| Command                      | Description                             |
|------------------------------|-----------------------------------------|
| `codex start --context ...`  | Launch Codex CLI with specified context |
| `codex ask "<prompt>"`      | Send a natural language prompt          |
| `codex files add <files...>` | Add additional context files or folders |
| `codex session save <name>`  | Save session snapshot for reuse         |

## Best Practices

- **Load Minimal Context**: Only include files needed for the task to reduce token usage.
- **Keep Context Updated**: Refresh summaries when key files change.
- **Use Clear Prompts**: Prefix prompts with markers (e.g., `###`) and specify framework/style.
- **Validate Output**: Always test generated code and run `npm test`/`lint` after changes.

## Troubleshooting

- If Codex responds unexpectedly, check for stale context or missing environment variables.
- Consult `docs/TROUBLESHOOTING.md` for common errors and resolutions.

## Contributing Updates

When project contexts or workflows evolve:
1. Update affected context summaries above.
2. Update `CHANGELOG.md` with a new release entry.
3. Review and update this `CODEX.md` file accordingly.

*** End of CODEX.md ***
