---
name: frontend-writing
description: Build or substantially revise UI in this personal site, including layouts, forms, navigation, and visual fixes. Use for frontend work where composition or rendered appearance matters; skip trivial copy edits.
---

# Frontend writing

Work within the project's `AGENTS.md` constraints. Use the versions and libraries in `chvaldez10/package.json` and the installed Next.js guide for APIs being changed.

## Understand the affected UI

- Read the target component and its parent page or layout. Find a comparable component already in the app, then inspect its controls, variants, styles, tokens, and responsive behavior before creating a new pattern. Look for inherited colors and transparent backgrounds before changing a surface.
- Identify the existing interaction, loading, empty, and error states. Preserve behavior outside the requested change.
- Before changing shared styles or controls, inspect the rendered baseline when practical. Note hover effects, cursor, motion, icon alignment, and what each control does; preserve them unless the user asks to change them. Do not suppress established animation solely because a reduced-motion rule seems preferable.

## Implement

- Make the smallest coherent change. Reuse project components, existing shadcn/Radix primitives, and established Tailwind or CSS patterns when they fit. Keep styles local unless a shared theme change is requested.
- Keep route pages focused on composition. Prefer server components; use `"use client"` only for browser state or events. Keep server-only code out of client components.
- Use semantic HTML and accurate props: links navigate, buttons act, labels name inputs, and focus remains visible. Preserve keyboard access and image fallbacks.
- Check the rendered combination of parent and child styles. Text, placeholders, borders, transparent fields, validation feedback, and disabled or focused controls must be readable on the actual surface.
- Treat copy as part of the layout. Preserve wording the user has chosen, and check that longer headlines or action labels do not wrap controls into nearby content.

## Verify the result

- Review the affected page at desktop and narrow widths when practical. Exercise the changed interaction and inspect nearby controls and relevant states, not only the edited component.
- For viewport-sized scenes, also check a short phone and the longest content state for clipping, overlays, and usable text and controls. A section matching viewport height does not prove its content fits; use a simpler composition or natural scrolling when the request permits.
- When motion matters to the experience, verify its behavior with reduced motion enabled as well as with ordinary motion.
- After a UI refactor, compare those affected interactions with the baseline in the browser. Check the actual hover state, animation, and click result, plus icon placement at narrow and desktop widths. A passing typecheck or lint does not verify visual behavior.
- Run the checks required by `AGENTS.md`. If browser access is unavailable, inspect the page, parent, and shared styles in code and report that visual behavior was not verified.
