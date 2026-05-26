---
name: tdd
description: Test-driven development workflow — write failing test, implement, refactor
---

When implementing a new feature or fixing a bug:

1. Write a failing test that describes the expected behavior
2. Run tests to confirm it fails: `npm test`
3. Write the minimum code to make the test pass
4. Run tests to confirm it passes: `npm test`
5. Refactor if needed while keeping tests green
6. Verify no regressions in the full suite

Never write implementation before the test exists.
If the test framework is not set up, set it up first.
