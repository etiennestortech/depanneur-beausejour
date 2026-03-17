# Depanneur Beausejour

Marketing site for Groupe Beausejour, built as a lightweight static site with Tailwind CSS v4 and a small HTML include/build step.

## Stack

- Static HTML pages in `src/pages`
- Shared partials in `src/partials`
- Design tokens in `src/input.css`
- Shared component classes in `src/components.css`
- Tailwind CSS v4 for styling
- Simple Node build script for page assembly

## Commands

```bash
npm install
npm run build
npm run dev
```

## Project Structure

```text
src/
  assets/        Static site assets
  pages/         Page templates
  partials/      Shared HTML partials
  input.css      Tailwind entrypoint and theme tokens
  components.css Shared component classes
dist/            Generated site output
build.js         HTML include/build script
```

## Notes

- `dist/` is generated and should not be edited by hand.
- `wireframe/` is treated as a separate reference repository and is intentionally excluded from this site repo.
- The current focus is establishing the homepage as the visual and system reference for the rest of the site.

## Workflow Direction

- Keep tokens centralized in `src/input.css`
- Keep shared primitives minimal and reusable
- Prefer Tailwind utilities in page markup for one-off composition
- Extract only stable, repeated patterns into `src/components.css`
