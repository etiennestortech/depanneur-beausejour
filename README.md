# Groupe Beauséjour — Website

Marketing site for Groupe Beauséjour, a convenience store chain in Abitibi, Quebec. Built as a lightweight static site with Tailwind CSS v4, shared HTML partials, and a small Node build step.

## Stack

- Static HTML pages in `src/pages/`
- Shared partials in `src/partials/`
- Tailwind CSS v4 — tokens in `src/input.css`, component classes in `src/components.css`
- Vanilla JS with GSAP + ScrollTrigger + Lenis in `src/js/main.js`
- Simple Node build script in `build.js`
- Deployed via GitHub Pages from the `gh-pages` branch

## Commands

```bash
npm install          # Install dependencies
npm run build        # Full build (HTML + CSS) → dist/
npm run build:html   # HTML partials only
npm run build:css    # CSS only
npm run dev          # Build HTML then watch CSS
```

> After editing `src/components.css` or `src/input.css`, always run `npm run build` — CSS changes require the Tailwind build step.

## Project Structure

```
src/
  assets/        Images, icons, fonts
  js/            Shared frontend behavior (main.js)
  pages/         Page templates (edit these, not dist/)
  partials/      Shared HTML partials (header, footer, head, scripts)
  input.css      Tailwind entrypoint + design tokens
  components.css Shared component classes
dist/            Generated site output (gitignored — do not edit directly)
build.js         HTML include/build script
```

## Branch Strategy

| Branch     | Purpose |
|------------|---------|
| `main`     | Production-ready source code. Only updated via PR from `dev`. |
| `dev`      | Active development. All client work-in-progress goes here. |
| `gh-pages` | Live site (built output). Deploy via the process below — do not edit directly. |

**Workflow:**
1. Work on `dev`
2. When ready, open a PR from `dev` → `main`
3. After merging to `main`, deploy to `gh-pages`

## Deploying to GitHub Pages

`dist/` is gitignored on `main`. To push a new build to the live site:

```bash
npm run build
git worktree add /tmp/beausejour-gh-pages origin/gh-pages
rsync -av --delete --exclude='.git' dist/ /tmp/beausejour-gh-pages/
cd /tmp/beausejour-gh-pages
git checkout -b gh-pages
git add -A
git commit -m "Deploy: <description>"
git push origin gh-pages:gh-pages
git worktree remove /tmp/beausejour-gh-pages --force
```

## Design System Principles

- Keep source of truth in `src/`, never `dist/`
- Tokens (spacing, typography, colors, radii) live in `src/input.css`
- Component classes live in `src/components.css` — extract only patterns that repeat across multiple pages
- The homepage (`src/pages/index.html`) is the reference implementation for layout and visual direction
- Prefer Tailwind utilities for page-level composition; extract to component classes only when stable and reused
- Smooth scroll via Lenis, scroll animations via GSAP + ScrollTrigger — keep motion restrained and performant
