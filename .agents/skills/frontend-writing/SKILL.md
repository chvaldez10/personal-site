---
name: frontend-writing
description: Build or substantially revise UI in this personal site, including layouts, forms, navigation, and visual fixes. Use for frontend work where composition or rendered appearance matters; skip trivial copy edits.
---

# Frontend writing

Work within the project's `AGENTS.md` constraints. Use the versions and libraries in `chvaldez10/package.json` and the installed Next.js guide for APIs being changed.

## Understand the affected UI

- Read the target component and its parent page or layout. Find a comparable component already in the app, then inspect its controls, variants, styles, tokens, and responsive behavior before creating a new pattern. Look for inherited colors and transparent backgrounds before changing a surface.
- Identify the existing interaction, loading, empty, and error states. Preserve behavior outside the requested change.
- Before changing shared styles or controls, identify which visible part or state the request targets and inspect the rendered baseline when practical. Check the full interaction, including opened panels, options, selected and focus states, and opening and closing motion. Preserve established behavior unless the user asks to change it; reduced-motion support should not remove ordinary animation.

## Implement

- Make the smallest coherent change. Reuse project components, existing shadcn/Radix primitives, and established Tailwind or CSS patterns when they fit. Extract a shared component when it removes concrete repeated structure or behavior; keep one-off styles local.
- When a visual behavior should apply to every instance of a shared primitive, update its default instead of relying on each caller to opt in. Keep explicit opt-outs for genuine exceptions.
- Keep route pages focused on composition. Prefer server components; use `"use client"` only for browser state or events. Keep server-only code out of client components.
- Use semantic HTML and accurate props: links navigate, buttons act, labels name inputs, and focus remains visible. Preserve keyboard access and image fallbacks.
- Check the rendered combination of parent and child styles. Text, placeholders, borders, transparent fields, validation feedback, and disabled or focused controls must be readable on the actual surface.
- Treat copy as part of the layout. Preserve wording the user has chosen, and check that longer headlines or action labels do not wrap controls into nearby content.

## Verify the result

- Review the affected page at desktop and narrow widths when practical. Exercise the whole changed interaction, including opening, selection, keyboard use, and closing where relevant.
- For viewport-sized scenes, also check a short phone and the longest content state for clipping, overlays, and usable text and controls. A section matching viewport height does not prove its content fits; use a simpler composition or natural scrolling when the request permits.
- When motion matters to the experience, verify both entrance and exit with ordinary and reduced motion settings.
- After a UI refactor, compare those affected interactions with the baseline in the browser. Check the actual hover state, animation, and click result, plus icon placement at narrow and desktop widths. A passing typecheck or lint does not verify visual behavior.
- Run the checks required by `AGENTS.md`. If browser access is unavailable, inspect the page, parent, and shared styles in code and report that visual behavior was not verified.
