---
name: "OPSX: Bulk Archive"
description: "Archive all completed changes at once, with conflict detection"
category: Workflow
tags: [workflow, archive, experimental]
---

Archive multiple completed changes at once.

Detects all changes with complete tasks, checks for spec conflicts across changes, and archives them in chronological order.

---

**Input**: No change name needed. Operates across all active changes.

**Steps**

1. **Find all active changes**

   ```bash
   openspec list --json
   ```

   Parse the JSON to get all changes that are not already archived.

2. **Check task completion for each change**

   For each change, read its `tasks.md` (if it exists) and count:
   - Complete: `- [x]`
   - Incomplete: `- [ ]`

   Separate into:
   - **Completed**: all tasks done (or no tasks file)
   - **In progress**: has incomplete tasks

3. **If no completed changes found**, inform the user:

   ```
   No changes with all tasks complete.

   In progress:
   - <change-name>: N/M tasks complete
   ```

   Stop.

4. **Check for spec conflicts among completed changes**

   For each completed change, check which capabilities its delta specs touch (`openspec/changes/<name>/specs/<capability>/`).

   If two or more completed changes touch the same capability:
   - Inspect the actual codebase to understand what's implemented
   - Determine whether the changes are additive (safe to layer) or conflicting (require manual resolution)
   - Report the finding clearly before proceeding

5. **Show archive plan and confirm**

   ```
   ## Bulk Archive

   Completed changes (3):
   - add-dark-mode       (12/12 tasks, touches: ui/)
   - fix-login-redirect  (4/4 tasks, no delta specs)
   - update-footer       (6/6 tasks, touches: ui/)

   ⚠ Spec conflict: add-dark-mode and update-footer both touch ui/
     → Inspected codebase: changes are additive, will apply in chronological order

   In progress (1):
   - optimize-queries    (3/7 tasks) — skipping

   Archive all 3 completed changes?
   ```

   Use **AskUserQuestion tool** to confirm.

6. **Archive each change in chronological order**

   Process completed changes ordered by creation date (from `.openspec.yaml`).

   For each change:
   - If delta specs exist: merge them into `openspec/specs/` before archiving
   - Generate target name: `YYYY-MM-DD-<change-name>` (use today's date)
   - Move directory: `mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>`
   - Report: "✓ Archived <name>"

7. **Show final summary**

   ```
   ## Bulk Archive Complete

   ✓ Archived add-dark-mode
   ✓ Archived fix-login-redirect
   ✓ Archived update-footer
   Specs merged in order: ui/ (add-dark-mode → update-footer)

   1 change still in progress: optimize-queries
   ```

**Guardrails**
- Never archive changes with incomplete tasks — skip them silently (report in summary)
- When spec conflicts exist, always inspect the codebase before reporting — don't just flag abstractly
- Archive in chronological order to apply spec layers correctly
- If an archive target already exists (same name + date), fail that individual change with an error and continue with the rest
