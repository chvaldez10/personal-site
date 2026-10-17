---
name: frontend-writing
description: Build or substantially revise UI in this personal site, including layouts, forms, navigation, and visual fixes. Use for frontend work where composition or rendered appearance matters; skip trivial copy edits.
---

# Frontend writing

Work within the project's `AGENTS.md` constraints. Use the versions and libraries in `chvaldez10/package.json` and the installed Next.js guide for APIs being changed.

## Understand the affected UI

- Read the target component, its parent page or layout, shared controls it renders, and their relevant styles. Look for inherited colors and transparent backgrounds before changing a surface.
- Identify the existing interaction, loading, empty, and error states. Preserve behavior outside the requested change.

## Implement

- Make the smallest coherent change. Reuse the existing shadcn/Radix components and Tailwind patterns when they fit. Keep styles local unless a shared theme change is requested.
- Keep route pages focused on composition. Prefer server components; use `"use client"` only for browser state or events. Keep server-only code out of client components.
- Use semantic HTML and accurate props: links navigate, buttons act, labels name inputs, and focus remains visible. Preserve keyboard access and image fallbacks.
- Check the rendered combination of parent and child styles. Text, placeholders, borders, transparent fields, validation feedback, and disabled or focused controls must be readable on the actual surface.

## Verify the result

- Review the affected page at desktop and narrow widths when practical. Exercise the changed interaction and inspect nearby controls and relevant states, not only the edited component.
- Run the checks required by `AGENTS.md`. If browser access is unavailable, inspect the page, parent, and shared styles in code and report that visual behavior was not verified.
