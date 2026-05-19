---
name: "source-command-opsx-verify"
description: "Validate a change's implementation against its artifacts before archiving"
---

# source-command-opsx-verify

Use this skill when the user asks to run the migrated source command `opsx-verify`.

## Command Template

Validate the implementation of a change against its artifacts across three dimensions: Completeness, Correctness, and Coherence.

Use this before archiving to catch mismatches between what was planned and what was built.

---

**Input**: Optionally specify a change name after `/opsx:verify` (e.g., `/opsx:verify add-auth`). If omitted, infer from context or prompt.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` and use **AskUserQuestion tool** to let the user select

   Always announce: "Verifying change: <name>"

2. **Read all context files**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   Read every file path listed under `contextFiles` (proposal, specs, design, tasks, etc.).

3. **Explore the implementation**

   Read the relevant source code for the change — files modified, functions added, tests written. Ground the verification in what's actually in the codebase, not assumptions.

4. **Check the three dimensions**

   **COMPLETENESS** — Is everything done?
   - All tasks in tasks.md are checked `[x]`
   - Every requirement in specs has corresponding code
   - Scenarios described in specs are handled or tested

   **CORRECTNESS** — Does it do the right thing?
   - Implementation matches the intent defined in the specs
   - Edge cases from scenarios are handled
   - Error states match spec definitions

   **COHERENCE** — Is it consistent?
   - Design decisions from design.md are reflected in the code structure
   - Naming conventions are consistent with design.md
   - Patterns match what was designed

5. **Report findings**

   ```
   ## Verifying: <change-name>

   COMPLETENESS
   ✓ All 12 tasks in tasks.md are checked
   ✓ All requirements in specs have corresponding code
   ⚠ Scenario "Session timeout after inactivity" not tested

   CORRECTNESS
   ✓ Implementation matches spec intent
   ✓ Edge cases from scenarios are handled
   ⚠ Error response format differs from spec definition

   COHERENCE
   ✓ Design decisions reflected in code structure
   ✓ Naming conventions consistent with design.md

   SUMMARY
   ─────────────────────────────
   Critical issues: 0
   Warnings: 2
   Ready to archive: Yes (with warnings)

   Recommendations:
   1. Add test for session timeout scenario
   2. Align error response format with spec or update spec to match
   ```

**Guardrails**
- Verify does NOT block archive — it surfaces issues for the user to decide on
- Be specific: name the exact task, requirement, or scenario that has an issue
- Distinguish critical issues (wrong or missing implementation) from warnings (inconsistencies worth considering)
- Read only — do NOT modify any files during verification
