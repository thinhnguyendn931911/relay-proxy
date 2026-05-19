---
name: "OPSX: Fast-Forward"
description: "Create all remaining planning artifacts for an existing change in one shot"
category: Workflow
tags: [workflow, artifacts, experimental]
---

Fast-forward: create all remaining planning artifacts for an existing change at once.

Use this when the scope is clear and you don't need to review artifacts step by step. For one-at-a-time creation, use `/opsx:continue`.

---

**Input**: Optionally specify a change name after `/opsx:ff` (e.g., `/opsx:ff add-auth`). If omitted, infer from context or prompt.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` and use **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>"

2. **Check current status**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse to get:
   - `applyRequires`: artifact IDs needed before implementation
   - `artifacts`: all artifacts with status and dependencies

   If all `applyRequires` artifacts are already `done`, inform the user — nothing to do. Suggest `/opsx:apply`.

3. **Create all remaining artifacts in sequence**

   Use the **TodoWrite tool** to track progress.

   Loop through artifacts in dependency order until all `applyRequires` artifacts are `done`:

   a. **For each artifact with `status: "ready"`**:
      - Get instructions:
        ```bash
        openspec instructions <artifact-id> --change "<name>" --json
        ```
      - Read any dependency files listed in `dependencies`
      - Create the artifact at `outputPath` using the `template` structure
      - Apply `context` and `rules` as constraints — do NOT copy them into the file
      - Show brief progress: "✓ <artifact-id>"

   b. After each artifact, re-run `openspec status --change "<name>" --json` and check if all `applyRequires` are `done`. Stop when they are.

   c. If an artifact requires user input, use **AskUserQuestion tool** then continue.

4. **Show final status**

   ```bash
   openspec status --change "<name>"
   ```

**Output**

```
## Fast-Forwarding: <change-name>

✓ proposal.md
✓ specs/auth/spec.md
✓ design.md
✓ tasks.md

All planning artifacts created! Ready for implementation.
Run `/opsx:apply` to start.
```

**Guardrails**
- Always read dependency artifacts before creating a new one
- `context` and `rules` from instructions are for you — never copy them into output files
- If context is critically unclear, ask the user — but prefer reasonable decisions to keep momentum
- Verify each artifact file exists after writing before proceeding to the next
