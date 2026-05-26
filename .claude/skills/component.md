---
name: component
description: Scaffold a new UI component with tests and stories
---

When the user asks to create a new component:

1. Ask for: component name, props interface, parent component (if any)
2. Create the component file following existing patterns:
   - Use semantic HTML
   - Add proper TypeScript types for props
   - Include ARIA attributes where needed
3. Create a test file with:
   - Render test
   - Prop variation tests
   - Interaction tests (click, input, etc.)
4. If Storybook is present, create a story file
5. Export from the appropriate index file

Framework: nextjs
CSS: tailwind, postcss
