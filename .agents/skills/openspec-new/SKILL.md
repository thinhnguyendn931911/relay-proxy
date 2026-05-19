---
name: openspec-new
description: Start a new change scaffold without generating artifacts. Use when the user wants explicit control over artifact creation step-by-step.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.3.1"
---

Start a new change — create the scaffold and decide how to build artifacts next.

After creating the scaffold, use `/opsx:continue` to create artifacts one at a time, or `/opsx:ff` to generate all planning artifacts at once.

---

**Input**: The user's request should include a change name (kebab-case) OR a description of what they want to build.

**Steps**

1. **If no clear input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" → `add-user-auth`).

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

2. **Check if change already exists**

   ```bash
   openspec list --json
   ```

   If a change with that name already exists, use **AskUserQuestion tool** to ask if the user wants to continue it or create a new one.

3. **Create the change scaffold**

   ```bash
   openspec new change "<name>"
   ```

   This creates `openspec/changes/<name>/` with `.openspec.yaml`.

4. **Check what's ready**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse the JSON to understand the artifact sequence and what's first in line.

5. **Show status and next steps**

   ```
   Created: openspec/changes/<name>/

   Ready to create: <first artifact>

   Options:
   - /opsx:continue  — create one artifact at a time (review as you go)
   - /opsx:ff        — create all planning artifacts at once
   ```

**Guardrails**
- Only create the scaffold — do NOT generate any artifacts
- If the change name already exists, always confirm with the user before proceeding
