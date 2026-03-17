# Depanneur Beausejour

Marketing site for Groupe Beausejour, built as a lightweight static site with Tailwind CSS v4, shared HTML partials, and a small Node build step.

The project should stay Tailwind-first:

- prefer utilities for page composition
- keep tokens centralized in `src/input.css`
- keep `src/components.css` limited to stable shared primitives
- avoid growing a second custom CSS framework inside the project

## Current State

The homepage is the current reference page for the system and visual direction.

It now includes:

- shared typography, spacing, color, and radius tokens
- a reusable button treatment with text-clip hover animation
- shared slider logic for the stores carousel
- a simplified GSAP + Lenis motion layer
- stat counters tied to reveal timing
- optimized homepage image assets with responsive variants for the heaviest images

The rest of the site should be built from this direction, not as separate visual experiments.

## Stack

- Static HTML pages in `src/pages`
- Shared partials in `src/partials`
- Tailwind CSS v4
- Design tokens in `src/input.css`
- Shared component classes in `src/components.css`
- Shared frontend behavior in `src/js/main.js`
- Simple Node build script in `build.js`

## Commands

```bash
npm install
npm run build
npm run dev
```

## Project Structure

```text
src/
  assets/        Images, icons, fonts, and optimized media variants
  js/            Shared frontend behavior
  pages/         Page templates
  partials/      Shared HTML partials
  input.css      Tailwind entrypoint and design tokens
  components.css Shared component primitives and section systems
dist/            Generated site output
build.js         HTML include/build script
```

## Build Behavior

- `npm run build` rebuilds `dist/` from scratch
- `build.js` assembles pages from `src/pages` and `src/partials`
- `src/assets` and `src/js` are copied into `dist`
- backup pages are excluded from the intended build output
- `dist/` is generated and should not be edited by hand

## Design System Direction

- Keep source of truth in `src/`, not `dist/`
- Use `src/input.css` for tokens and global scale decisions
- Use `src/components.css` for shared patterns like buttons, cards, titles, containers, footer shell, and homepage systems that are stable enough to reuse
- Use page markup for one-off layout composition
- Extract patterns only when they repeat and are clearly stable
- Reuse the homepage spacing, type rhythm, cards, CTA patterns, and interaction behavior when building the inner pages

## Motion And Interaction

- Smooth scroll is handled with Lenis
- Scroll-based animation is intentionally restrained to avoid jitter
- GSAP/ScrollTrigger is used for title reveals, the hero parallax, and stat counters
- Shared interactions live in `src/js/main.js`, not inline page scripts

## Notes

- `wireframe/` is treated as a separate reference repository and is intentionally excluded from this site repo
- the repo is private and intended for active design and implementation work
- current working branch for homepage system exploration: `codex/homepage-tailwind-refactor`
