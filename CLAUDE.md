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

## Page Layout Rules (IMPORTANT — follow these on every page)

The **homepage (`src/pages/index.html`)** is the reference implementation. All inner pages must follow these patterns exactly.

### Section structure
Every section follows this wrapper pattern:
**White sections** (standard):
```html
<section class="section py-[var(--space-section-lg)]">
  <div class="container"><!-- content --></div>
</section>
```

**Grey / dark card sections** (rounded panel with gutter):
```html
<section class="section-alt"><!-- or section-dark -->
  <div class="section-alt-inner py-[var(--space-section-lg)]"><!-- or section-dark-inner -->
    <div class="container"><!-- content --></div>
  </div>
</section>
```

**CTA banner sections** (edge-to-edge rounded banner):
```html
<section class="section-cta">
  <div class="cta-banner"><!-- content --></div>
</section>
```

- White sections use `py-[var(--space-section-lg)]` for main sections, `py-[var(--space-section-md)]` only for compact subsections
- Card sections (`.section-alt`, `.section-dark`, `.section-cta`) have `--space-section-gap` gutter built in — do NOT add `py-*` on the outer `<section>`
- Inner panels (`.section-alt-inner`, `.section-dark-inner`) handle their own content padding via `py-[var(--space-section-lg)]`
- Never use custom wrapper classes like `.faq-shell`, `.store-finder` — use the shared section classes
- Never use inline `style=""` for spacing — always use token-based Tailwind classes

### Inner page heroes
Inner pages use `.inner-hero-shell` (a grid layout), NOT the homepage `.hero-v2`. The structure is:
```html
<section class="section py-[var(--space-section-lg)]">
  <div class="container inner-hero-shell">
    <div class="inner-hero-copy">
      <span class="eyebrow">Section label</span>
      <h1 class="page-title" data-reveal-text>Page title here.</h1>
      <p class="body-text-lg text-text-muted max-w-prose">Description text.</p>
    </div>
    <div class="inner-hero-aside">
      <!-- optional image or card -->
    </div>
  </div>
</section>
```

### Typography — use tokens, never hardcode
| Element | Class / Token |
|---------|--------------|
| Page title (h1) | `.page-title` |
| Section title (h2) | `.section-title` |
| Card title (h3) | `.card-title` |
| Section label | `.eyebrow` |
| Section description | `.section-subtitle` |
| Body large | `.body-text-lg` |
| Body | `.body-text` |
| UI / small | `font-size: var(--type-size-ui)` |

Never hardcode font sizes like `text-[1.75rem]` or `font-size: 0.95rem`. Use tokens from `src/input.css`.

### Spacing — use tokens, never hardcode
| Use case | Token |
|----------|-------|
| Section vertical padding | `py-[var(--space-section-lg)]` or `py-[var(--space-section-md)]` |
| Card section gutter | `--space-section-gap` (built into `.section-alt`, `.section-dark`, `.section-cta`) |
| Gap between section header and content | `gap-[var(--space-section-md)]` |
| Inner component gaps | Tailwind utilities: `gap-2`, `gap-4`, `gap-8` |

Never use `py-20`, `py-24 lg:py-28`, `mt-16` for section spacing — always use the `--space-section-*` tokens.

### Border radius — use tokens
| Element | Token |
|---------|-------|
| Cards, images | `rounded-card` or `rounded-card-lg` |
| Buttons, pills | `var(--radius-btn)` or `var(--radius-pill)` |
| Inputs | `var(--radius-input)` |

Never hardcode `rounded-2xl` or `border-radius: 999px`.

### Widths — use Tailwind or tokens
- Max content widths: `max-w-prose`, `max-w-2xl`, `max-w-3xl`, `max-w-4xl`
- Never hardcode `max-w-[12ch]`, `max-w-[40rem]`, etc.

### Reusable component classes (use these, don't reinvent)
- `.card-padded` — padded card with border and radius
- `.card-compact` — smaller padded card
- `.solution-card` — image + title + description card
- `.editorial-split` — two-column content layout
- `.intro-center` — centered section header (eyebrow + title + subtitle + CTA)
- `.intro-left` — left-aligned section header
- `.btn-primary`, `.btn-neutral` — buttons
- `.hero-v2-pill` — pill links with icon
- `.slider-btn` — carousel arrow buttons
- `.media-image-cover` — responsive cover image inside overflow-hidden container

### Images
- Always use `loading="lazy" decoding="async"` on non-hero images
- Always wrap images in `overflow-hidden rounded-card` (or `rounded-card-lg`)
- Use `data-reveal-image` attribute for scroll-triggered clip-reveal animation
- Use `data-parallax` / `data-parallax-container` for parallax effect
- Compress images to ~1200px max dimension for cards, ~2560px for hero/full-bleed

### Animations
- `data-reveal-text` on headings for word-by-word reveal
- `data-reveal-image` on image wrappers for clip-reveal
- `data-parallax` on images for scroll parallax
- `data-stats-group` / `data-counter-target` for counting stats
- All scroll animations trigger at `top 85%` with `once: true`
- Respect `prefers-reduced-motion`

### What NOT to do
- Don't create page-specific component classes (`.faq-shell`, `.store-finder-wrapper`, etc.) — use the shared layout classes
- Don't use inline styles (`style="padding: ..."`) — use Tailwind utilities with tokens
- Don't hardcode colors — use `text-text-heading`, `text-text-muted`, `bg-surface-alt`, etc.
- Don't use different hero patterns per page — inner pages use `.inner-hero` or `.simple-hero`, homepage uses `.hero-v2`
- Don't duplicate component markup — if a pattern exists in `components.css`, use it
- Don't place `.editorial-note-card` side-by-side with an image inside `.editorial-split-media` — always stack vertically (note card below the image)
- `.section-alt` (grey background) before the footer is fine — the spacing system handles the transition cleanly
- First section after an `.inner-hero` or `.simple-hero` must use a white background (`.section`), never `.section-dark` or `.section-alt` — the hero already has a dark/grey visual weight, so the first content section needs contrast with a clean white background
- First section after an `.inner-hero` should use `.intro-center`, not `.intro-left` — the hero card has different inset padding than the container, so left-aligned titles feel misaligned

## File Structure
- `src/pages/` — source HTML pages (edit these, not `dist/`)
- `src/partials/` — shared HTML partials (header, footer, head, scripts)
- `src/components.css` — component classes
- `src/input.css` — Tailwind entry point + design tokens
- `dist/` — built output (do not edit directly)
- `dist/assets/` — images, fonts, icons

## Component Inventory

All reusable patterns defined in `src/components.css`, organized by section:

### Heroes
- **`.hero-v2`** — Homepage hero: rounded inset card with background image, overlay, title, CTA, and pills
- **`.inner-hero`** — Inner page hero (image card): used on nos-magasins, carrieres, fournisseurs, lave-auto, pret-a-manger
- **`.simple-hero`** — Text-only hero (white background, centered): used on contact, faq, legal pages

### Layouts
- **`.editorial-split`** — Two-column content layout (copy + media, 5/7 grid)
- **`.intro-center`** — Centered section header (eyebrow + title + subtitle + CTA)
- **`.intro-left`** — Left-aligned section header
- **`.statement-panel`** — Dark background panel with large quote text

### Cards
- **`.card-padded`** — Padded card with border, radius, and shadow
- **`.card-compact`** — Smaller padded card (lists, job postings)
- **`.solution-card`** — Image + title + description card
- **`.editorial-note-card`** — Small note card with kicker, title, and body
- **`.editorial-media-card`** — Overflow-hidden image card with border and shadow
- **`.carwash-card`** — Icon + text card for car wash features (homepage)
- **`.store-card`** — Full-bleed image overlay card (homepage slider)
- **`.store-finder-card`** — Bordered list card with metadata (nos-magasins)
- **`.about-value-card`** — Values card with icon (a-propos)
- **`.about-timeline-card`** — Timeline entry card (a-propos)
- **`.partner-logo`** — Logo display card (a-propos)

### Sections
- **`.section`** — Default page background
- **`.section-alt`** — Alternate (light gray) background
- **`.section-dark`** — Dark background with inverse text

### Forms
- **`.contact-form-panel`** — Form container card with border and shadow
- **`.contact-form-title`** — Form heading (h3)
- **`.contact-form-fields`** — Grid layout for form fields
- **`.contact-form-field`** — Label + input wrapper
- **`.contact-form-label`** — Form label
- **`.contact-form-input`** — Form input (used alongside `.form-input`)
- **`.contact-form-textarea`** — Textarea variant
- **`.contact-form-submit`** — Full-width submit button

### Interactive
- **`.faq-item`** — Accordion item using `<details>`/`<summary>`
- **`.store-slider`** — Horizontal scroll carousel for store cards
- **`.slider-btn` / `.slider-dot`** — Carousel navigation controls
- **`.careers-marquee`** — Auto-scrolling image marquee
- **`.about-hero-ribbon`** — Auto-scrolling tilted card ribbon (a-propos)

## Git & Workflow
- Remote: `origin` → `https://github.com/etiennestortech/depanneur-beausejour.git`
- **Branch strategy:**
  - `main` — production source code, only updated via PR from `dev`
  - `dev` — active development, all client work goes here
  - `gh-pages` — live site (built output), deployed via worktree — do not edit directly
- All work-in-progress goes on `dev`. When ready, open a PR from `dev` → `main`, then deploy to `gh-pages`
- Commit after completing work — don't batch up multiple unrelated changes
- Keep commits focused and descriptive
- To deploy to live site: build → rsync `dist/` into a `gh-pages` worktree → commit → push to `origin/gh-pages`
