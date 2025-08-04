# Codex CLI Integration

This directory contains configuration and state files for seamless continuation between Claude Code and Codex CLI sessions.

## Files

- **memory.json** - Session memory and context from recent work
- **session.json** - Current session state and metadata
- **config.json** - Codex configuration for this project
- **README.md** - This file

## Usage

When starting a new Codex CLI session:

```bash
codex start --config .codex/config.json
```

This will automatically load:
- Project context from configured files
- Session state from previous work
- Memory of recent changes and patterns

## Updating

These files are automatically updated by AI assistants when preparing for Codex handoff. Manual updates should be avoided to prevent conflicts.

## Last Updated

- Date: August 4, 2025
- Version: 3.2.0
- By: Claude Code
- Purpose: Continue development after deprecation fixes and TypeScript improvements