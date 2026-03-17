# Groupe Beauséjour — Website

## Stack
- **HTML** with a simple build system (`node build.js`) that processes `src/pages/*.html` → `dist/*.html` using `<!-- @include -->` partials and `<!-- @set -->` variables
- **Tailwind CSS v4** (`@tailwindcss/cli`) — `src/input.css` → `dist/styles.css`
- **Vanilla JS** — `dist/js/main.js` + inline scripts
- **Lenis** for smooth scrolling

## Build
- HTML only: `npm run build:html` (or `node build.js`)
- CSS only: `npm run build:css`
- Full build: `npm run build` (HTML then CSS)
- Dev with watch: `npm run dev`

**Important:** After editing CSS in `src/`, you must run both HTML and CSS builds. `node build.js` alone only builds HTML — CSS changes require `npm run build:css` (or `npm run build`).

## Design System
- Tokens are defined in `src/input.css` under `@theme` (colors, radii, shadows, fonts) and `:root` (layout, typography scale, spacing)
- Component classes live in `src/components.css` inside `@layer components`
- Follow Tailwind best practices: use utility classes first, extract to component classes only when a pattern repeats across multiple pages
- Keep CSS simple and readable — prefer responsive `@media` breakpoints over complex `calc()` / `max()` / `clamp()` nesting
- The site uses Tailwind v4's built-in `.container` which has responsive max-widths at each breakpoint (sm through 2xl). The custom `.container` in `@layer components` sets `max-width: var(--layout-shell-main)` but Tailwind's utility layer overrides it at wider viewports (96rem+ → 1536px). Keep this in mind when aligning full-bleed elements with container content edges.

## File Structure
- `src/pages/` — source HTML pages (edit these, not `dist/`)
- `src/partials/` — shared HTML partials (header, footer, head, scripts)
- `src/components.css` — component classes
- `src/input.css` — Tailwind entry point + design tokens
- `dist/` — built output (do not edit directly)
- `dist/assets/` — images, fonts, icons

## Git & Workflow
- Remote: `origin` → `https://github.com/etiennestortech/depanneur-beausejour.git`
- Commit after completing work — don't batch up multiple unrelated changes
- Keep commits focused and descriptive
