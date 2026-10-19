# Home sections

`src/app/(main)/page.tsx` composes the active sections exported from `index.tsx`.

## Layout

Use `home-container` for consistent section width and responsive side padding.
Keep scene-specific styling in its CSS module.

## Retained explorations

`MainHeader`, `ProcessCardStack`, `ThermalTicket`, `HeroStack`, and `BreadCrumbWithChangingContainers` are not mounted on the current home page. They remain available as references rather than alternate shared UI components.
