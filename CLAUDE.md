# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Coding Guidelines

### Think Before Coding

Before implementing, state assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If something is unclear, stop and ask. Push back when a simpler approach exists.

### Simplicity First

Write the minimum code that solves the problem. No speculative features, no abstractions for single-use code, no configurability that wasn't requested. If it could be 50 lines, don't write 200.

### Surgical Changes

Touch only what the request requires. Don't improve adjacent code, comments, or formatting. Match existing style. If your changes create orphaned imports/variables/functions, remove them — but don't remove pre-existing dead code unless asked.

### Goal-Driven Execution

For multi-step tasks, state a brief plan with verifiable steps before starting:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

---

## OpenSpec Workflow

Specs live in `openspec/changes/<change-name>/`. Each change has:
- `proposal.md` — what and why
- `design.md` — architecture decisions and trade-offs
- `tasks.md` — implementation checklist
- `specs/<capability>/spec.md` — scenario-level requirements per capability

Use the `/opsx:*` slash commands to manage the spec-driven workflow:
- `/opsx:propose <name>` — create a new change with all artifacts
- `/opsx:explore` — think through a problem before proposing
- `/opsx:apply` — implement tasks from an existing change
- `/opsx:archive` — finalize and archive a completed change
