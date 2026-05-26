---
name: plan
description: Break down a complex task into a verified implementation plan
---

When starting a non-trivial task:

1. Restate the goal in one sentence
2. List assumptions — ask about any that are uncertain
3. Identify risks and unknowns
4. Break into ordered steps, each with a verification check:

```
1. [Step] → verify: [how to confirm it worked]
2. [Step] → verify: [how to confirm it worked]
3. [Step] → verify: [how to confirm it worked]
```

5. Identify which steps can be parallelized
6. Flag any steps that are irreversible or affect shared state

Present the plan before implementing. Adjust based on feedback.
Do not start coding until the plan is confirmed.
