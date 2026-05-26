---
name: refactor
description: Safe refactoring — verify tests pass before and after every change
---

When refactoring code:

1. Ensure tests exist for the code being changed. If not, write them first.
2. Run tests to confirm green baseline: `npm test`
3. Make one refactoring step at a time
4. Run tests after each step
5. If tests break, revert and take a smaller step
6. Do not change behavior — refactoring preserves external behavior by definition

Common refactors:
- Extract function (>50 lines)
- Extract module (>800 lines)
- Replace magic numbers with named constants
- Flatten deep nesting with early returns
- Remove duplication (3+ occurrences)
