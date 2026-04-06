# Groupe Beauséjour — Website

Marketing site for Groupe Beauséjour, a convenience store chain in Abitibi, Quebec. Built as a lightweight static site with Tailwind CSS v4, shared HTML partials, and a small Node build step. Hosted on Cloudflare Pages with Cloudflare Pages Functions for form handling via Resend.

## Stack

- Static HTML pages in `src/pages/` (FR) and `src/pages/en/` (EN)
- Shared partials in `src/partials/` (FR) and `src/partials/en/` (EN)
- Tailwind CSS v4 — tokens in `src/input.css`, component classes in `src/components.css`
- Vanilla JS with GSAP + ScrollTrigger + Lenis in `src/js/main.js`
- Simple Node build script in `build.js`
- **Hosted on Cloudflare Pages** — auto-deploys on every push to `main`
- **Form handling** via Cloudflare Pages Functions (`functions/api/`) + Resend

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
  pages/         FR page templates (edit these, not dist/)
  pages/en/      EN page templates
  partials/      Shared FR HTML partials (header, footer, head, scripts)
  partials/en/   Shared EN HTML partials
  input.css      Tailwind entrypoint + design tokens
  components.css Shared component classes
functions/
  api/
    contact.js   Contact form → Resend
    supplier.js  Supplier form → Resend
    careers.js   Careers modal (+ CV attachment) → Resend
dist/            Generated site output (gitignored — built by Cloudflare)
build.js         HTML include/build script
wrangler.toml    Cloudflare Pages config
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production. Auto-deploys to Cloudflare Pages on push. |
| `dev`  | Active development. All client work-in-progress goes here. |

**Workflow:**
1. Branch from `dev`
2. Open a PR from feature branch → `dev`
3. Merge `dev` → `main` via PR when ready to ship
4. Cloudflare Pages picks up the push and deploys automatically — no manual deploy step needed

## Deployment

Cloudflare Pages project: **depanneur-beausejour**
Live URL: `depanneur-beausejour.pages.dev` (production domain: `groupebeausejour.com`, pending DNS setup)

Cloudflare builds on every push to `main` using:
- Build command: `npm run build`
- Output directory: `dist`
- Functions directory: `functions/`

## Environment Variables

Set in Cloudflare Pages dashboard (Settings → Environment variables) or via CLI:

```bash
npx wrangler pages secret put RESEND_API_KEY --project-name depanneur-beausejour
```

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key for transactional email |

## Local Dev with Functions

To test form submissions locally:

```bash
npx wrangler pages dev dist --binding RESEND_API_KEY=re_your_key_here
```

## Design System Principles

- Keep source of truth in `src/`, never `dist/`
- Tokens (spacing, typography, colors, radii) live in `src/input.css`
- Component classes live in `src/components.css` — extract only patterns that repeat across multiple pages
- The homepage (`src/pages/index.html`) is the reference implementation for layout and visual direction
- Prefer Tailwind utilities for page-level composition; extract to component classes only when stable and reused
- Smooth scroll via Lenis, scroll animations via GSAP + ScrollTrigger — keep motion restrained and performant
