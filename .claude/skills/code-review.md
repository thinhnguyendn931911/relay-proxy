---
name: code-review
description: Review code changes for quality, security, and correctness
---

When reviewing code (own or others'):

1. Check security first:
   - No hardcoded secrets, API keys, or tokens
   - User input validated at system boundaries
   - No injection vulnerabilities (SQL, XSS, command)
2. Check correctness:
   - Error handling at every level — no swallowed errors
   - Edge cases covered (empty, null, boundary values)
   - Async code handles failures properly
3. Check quality:
   - Functions <50 lines, files <800 lines
   - No deep nesting (>4 levels)
   - Clear naming — code reads like prose
   - No mutation of shared state
4. Check tests:
   - New code has corresponding tests
   - Tests cover happy path and failure cases

Rate issues: CRITICAL (block) / HIGH (should fix) / MEDIUM (consider) / LOW (note).
