---
name: "OPSX: Sync"
description: "Merge delta specs from a change into the main openspec/specs/ directory"
category: Workflow
tags: [workflow, sync, specs, experimental]
---

Sync delta specs from a change into the main spec store.

Delta specs live at `openspec/changes/<name>/specs/`. Main specs live at `openspec/specs/<capability>/spec.md`. Syncing merges the change's specs into the canonical spec store.

---

**Input**: Optionally specify a change name after `/opsx:sync` (e.g., `/opsx:sync add-auth`). If omitted, infer from context or prompt.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` and use **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>"

2. **Find delta specs**

   Check `openspec/changes/<name>/specs/` for spec files.

   If none exist, inform the user: "No delta specs found for <name>. Nothing to sync." and stop.

3. **Compare with main specs**

   For each delta spec at `openspec/changes/<name>/specs/<capability>/spec.md`:
   - Check if a main spec exists at `openspec/specs/<capability>/spec.md`
   - If yes: identify what's being added, changed, or removed
   - If no: this is a new capability being introduced

4. **Show sync preview before proceeding**

   ```
   ## Sync Preview: <change-name>

   auth/spec.md          → openspec/specs/auth/spec.md (update)
   rate-limiting/spec.md → openspec/specs/rate-limiting/spec.md (new)

   Changes:
   + 3 requirements added to auth/spec.md
   ~ 1 requirement modified in auth/spec.md
   + rate-limiting/spec.md created (new capability)

   Proceed with sync?
   ```

   Use **AskUserQuestion tool** to confirm before making any changes.

5. **Apply the sync**

   For each delta spec:
   - If a main spec exists: merge the delta content into it, preserving existing content
   - If no main spec exists: create `openspec/specs/<capability>/spec.md` from the delta

6. **Confirm completion**

   ```
   ## Sync Complete: <change-name>

   ✓ openspec/specs/auth/spec.md updated
   ✓ openspec/specs/rate-limiting/spec.md created
   ```

**Guardrails**
- Always show the sync preview and get confirmation before making changes
- Preserve existing content in main specs — only add or update what the delta spec introduces
- If a conflict exists (same requirement described differently in delta vs main), surface it to the user rather than auto-resolving
