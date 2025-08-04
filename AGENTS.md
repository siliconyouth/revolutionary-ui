# AGENTS.md - Revolutionary UI Factory System Agent Integration

This file provides guidance for the Codex CLI agent when working with the Revolutionary UI Factory System. It consolidates all AI agent context files, documentation, and changelogs to enable seamless, context-aware development.

## Critical Agent Context Files

Before starting any Codex CLI session, load the core context files and documentation:
- `CLAUDE.md`
- `CLAUDE_CONTEXT.md`
- `GEMINI.md`
- `docs/AI_INTEGRATION.md`
- `docs/CONTEXT_ENGINEERING.md`
- `CHANGELOG.md`
- `CLI_DOCUMENTATION.md`

Additionally, include any other relevant docs or changelogs under the `docs/` directory as needed.

## Context Summaries

Below are high-level summaries of each key context file, so agents get essential information even if external files change.

### CLAUDE.md
-*Purpose*: Guidance for Claude Code (claude.ai/code) containing project overview, core principles (factory-first design, declarative configurations, AI integration), quick-start steps, architecture diagram, workflows, key commands, testing guidelines, versioning, and best practices.

### CLAUDE_CONTEXT.md
-*Purpose*: Comprehensive technical context with project identity, metrics (code reduction, frameworks supported), full tech stack, dependencies, factory-pattern interfaces, configuration-driven development examples, AI context schemas, architecture patterns, plugin model, state management strategies, coding conventions, testing and deployment processes, performance and security considerations.

### GEMINI.md
-*Purpose*: Mirror of CLAUDE.md and CLAUDE_CONTEXT.md tailored for Google Gemini; includes same critical instructions, architecture overview, context loading advice, and best practices to ensure consistency across AI agents.

### docs/AI_INTEGRATION.md
-*Purpose*: AI Integration Guide covering natural-language component generation, multi-provider support (OpenAI, Anthropic, Google Gemini, Mistral), configuration steps (env vars, programmatic API), streaming responses, context-aware generation, code suggestions, analysis and framework transformation examples.

### docs/CONTEXT_ENGINEERING.md
-*Purpose*: Context Engineering Guide outlining best practices for structuring AI-friendly documentation: the three pillars (project instructions, technical context, dynamic context), freshness and maintenance, scannability, examples, multi-instance collaboration, token optimization, templates, and measuring context effectiveness.

### CHANGELOG.md
-*Purpose*: Maintains chronological record of releases (major/minor/patch), feature additions, fixes, and breaking changes to track project evolution.

### CLI_DOCUMENTATION.md
-*Purpose*: Describes the Revolutionary UI CLI system architecture: automatic post-install setup, AI-powered analysis, CLI commands (`analyze`, `setup`, `generate`, `list`, `info`), core components in `src/lib/factory/`, configuration catalogs, and build/release workflows.

## Supported AI Agents

| Agent               | Context Files                  | Use Case                                   |
|---------------------|--------------------------------|--------------------------------------------|
| Claude (Anthropic)  | CLAUDE.md, CLAUDE_CONTEXT.md   | Detailed explanations, long-context tasks  |
| Google Gemini       | GEMINI.md, CLAUDE_CONTEXT.md   | Fast, cost-effective code and content      |
| OpenAI Codex        | docs/AI_INTEGRATION.md         | Code generation, refactoring, analysis     |
| Mistral             | docs/AI_INTEGRATION.md         | Balanced speed and quality                 |

## Environment Setup

Ensure your AI provider API keys are configured in your environment (e.g. `.env.local` or shell):
```bash
# OpenAI
export OPENAI_API_KEY=sk-...

# Anthropic (Claude)
export ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
export GOOGLE_AI_API_KEY=...

# Mistral
export MISTRAL_API_KEY=...
```

## Starting a Codex CLI Session

Use the `codex` CLI tool to begin an AI-assisted coding workflow with all relevant context loaded:

```bash
# For TypeScript, Node.js, and Next.js coding sessions, use the GPT-4o Code Preview model
codex start \
  --model gpt-4o-code-preview \
  --context CLAUDE.md \
  --context CLAUDE_CONTEXT.md \
  --context GEMINI.md \
  --context docs/AI_INTEGRATION.md \
  --context docs/CONTEXT_ENGINEERING.md \
  --context CHANGELOG.md \
  --context CLI_DOCUMENTATION.md
```

*Tip:* You can simplify loading the entire `docs/` directory by using `--context docs`.

## Quick Usage Reference

| Command                           | Description                             |
|-----------------------------------|-----------------------------------------|
| `codex start --context ...`       | Launch Codex CLI with specified context |
| `codex ask "<your prompt>"`     | Send a prompt to the agent              |
| `codex files add <files...>`      | Add additional files or folders to context |
| `codex session save <name>`       | Save current session for later reuse    |

See the full Codex CLI reference for more details.

## Best Practices

- **Keep Context Fresh:** Update context files (`CLAUDE.md`, `CLAUDE_CONTEXT.md`, etc.) whenever significant changes are made.
- **Follow Context Engineering Guidelines:** Refer to `docs/CONTEXT_ENGINEERING.md` for patterns and conventions.
- **Modular Loading:** Load only the context necessary for your current task to optimize performance.
- **Use Persistent Instructions:** During sessions, prefix lines with `#` to add persistent directives.

## Troubleshooting

- Missing or outdated context can lead to incomplete or incorrect responses.
- Verify environment variables (`OPENAI_API_KEY`, etc.) are set and valid.
- Consult `docs/TROUBLESHOOTING.md` for common issues and resolutions.

## Contributing Updates

When adding or modifying features that affect agent workflows or context:
1. Update `CLAUDE.md` or `GEMINI.md` if the change impacts a specific agent.
2. Update `docs/CONTEXT_ENGINEERING.md` for new patterns or conventions.
3. Update `CHANGELOG.md` with the new entry.
4. Update this `AGENTS.md` file if the change affects context-loading workflows.

*** End of AGENTS.md ***
