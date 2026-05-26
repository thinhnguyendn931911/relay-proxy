---
name: debug
description: Systematic debugging — reproduce, isolate, fix, verify
---

When debugging a reported issue:

1. Reproduce: write a test or minimal script that triggers the bug
2. Isolate: narrow down to the smallest code path that causes it
3. Root cause: identify WHY it fails, not just WHERE
4. Fix: make the minimal change that addresses the root cause
5. Verify: run the reproduction test — it should pass
6. Regression: check that existing tests still pass: `npm test`

Do not guess-and-check. Do not fix symptoms without understanding the cause.
