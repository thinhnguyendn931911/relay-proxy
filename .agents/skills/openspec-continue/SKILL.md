---
name: openspec-continue
description: Create the next artifact for an existing change, one step at a time. Use when the user wants to review each artifact before moving on.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---

Create the next artifact for an existing change, one step at a time.

Use this when you want to review each artifact before moving on. For creating all remaining artifacts at once, use `/opsx:ff`.

---

**Input**: The user's request may include a change name. If omitted, infer from context or prompt.

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

   Parse to find the first artifact with `status: "ready"` (dependencies satisfied, not yet done).

   - If none are ready: explain what's blocking (e.g., a dependency hasn't been created yet)
   - If all `applyRequires` artifacts are done: inform the user — ready for implementation

3. **Create the next ready artifact**

   a. Get instructions:
      ```bash
      openspec instructions <artifact-id> --change "<name>" --json
      ```
   b. The instructions JSON includes:
      - `context`: Project background (constraints for you — do NOT include in output)
      - `rules`: Artifact-specific rules (constraints for you — do NOT include in output)
      - `template`: Structure to use for your output file
      - `instruction`: Schema-specific guidance for this artifact type
      - `outputPath`: Where to write the artifact
      - `dependencies`: Completed artifacts to read for context
   c. Read any dependency files listed in `dependencies`
   d. Create the artifact at `outputPath` using the `template` structure
   e. Apply `context` and `rules` as constraints — do NOT copy them into the file
   f. Confirm: "✓ Created <artifact-id>"

4. **Show updated status and next steps**

   ```bash
   openspec status --change "<name>"
   ```

   Prompt options:
   - "Run `/opsx:continue` for the next artifact"
   - "Run `/opsx:ff` to create all remaining artifacts at once"
   - If apply-ready: "Run `/opsx:apply` to start implementation"

**Guardrails**
- Create exactly ONE artifact per invocation — do not loop to the next
- Always read dependency artifacts before creating a new one
- If an artifact requires user clarification, use **AskUserQuestion tool** before proceeding
- `context` and `rules` from instructions are for you — never copy them into output files
