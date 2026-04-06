/**
 * Simple HTML build script for Groupe Beauséjour
 *
 * Processes src/pages/*.html → dist/*.html
 *
 * Directives:
 *   <!-- @set key value -->       — define a template variable
 *   <!-- @include path -->        — inline a partial (relative to src/)
 *   {{key}}                       — replaced with the variable value
 *   {{nav:slug}}                  — resolves to nav-link-active or nav-link
 *   {{nav-mobile:slug}}           — resolves to nav-mobile-link-active or nav-mobile-link
 */

import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname);
const SRC = join(ROOT, 'src');
const PAGES_DIR = join(SRC, 'pages');
const DIST = join(ROOT, 'dist');
const ASSETS_DIR = join(SRC, 'assets');
const JS_DIR = join(SRC, 'js');

function resetDist() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
}

function copyDir(source, destination) {
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function buildPage(filePath) {
  let html = readFileSync(filePath, 'utf-8');

  // 1. Extract @set directives
  const vars = {};
  html = html.replace(/<!--\s*@set\s+(\w+)\s+(.+?)\s*-->\n?/g, (_, key, value) => {
    vars[key] = value.trim();
    return '';
  });

  // 2. Process @include directives (supports nesting)
  const MAX_DEPTH = 5;
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const before = html;
    html = html.replace(/<!--\s*@include\s+(.+?)\s*-->/g, (_, partialPath) => {
      const fullPath = join(SRC, partialPath.trim());
      return readFileSync(fullPath, 'utf-8');
    });
    if (html === before) break;
  }

  // 3. Replace nav active class helpers
  const activeNav = vars.activeNav || '';
  html = html.replace(/\{\{nav:([^}]+)\}\}/g, (_, slug) =>
    slug.trim() === activeNav ? 'nav-link-active' : 'nav-link'
  );
  html = html.replace(/\{\{nav-mobile:([^}]+)\}\}/g, (_, slug) =>
    slug.trim() === activeNav ? 'nav-mobile-link-active' : 'nav-mobile-link'
  );
  html = html.replace(/\{\{nav-dropdown:([^}]+)\}\}/g, (_, slug) =>
    slug.trim() === activeNav ? 'nav-dropdown-link-active' : 'nav-dropdown-link'
  );

  // 4. Replace remaining {{var}} placeholders
  html = html.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    vars[key] !== undefined ? vars[key] : match
  );

  return html;
}

// Process all pages
resetDist();

const pages = readdirSync(PAGES_DIR).filter((file) => (
  file.endsWith('.html') &&
  !file.includes('.backup.') &&
  !file.includes('.v1-backup.')
));

for (const page of pages) {
  const src = join(PAGES_DIR, page);
  const dest = join(DIST, page);
  const html = buildPage(src);
  writeFileSync(dest, html, 'utf-8');
  console.log(`  ✓ ${page}`);
}

console.log(`\nBuilt ${pages.length} pages → dist/`);

// Process English pages (src/pages/en/ → dist/en/)
const EN_PAGES_DIR = join(SRC, 'pages', 'en');
const EN_DIST = join(DIST, 'en');

try {
  mkdirSync(EN_DIST, { recursive: true });
  const enPages = readdirSync(EN_PAGES_DIR).filter((file) => (
    file.endsWith('.html') &&
    !file.includes('.backup.')
  ));
  for (const page of enPages) {
    const src = join(EN_PAGES_DIR, page);
    const dest = join(EN_DIST, page);
    const html = buildPage(src);
    writeFileSync(dest, html, 'utf-8');
    console.log(`  ✓ en/${page}`);
  }
  if (enPages.length > 0) console.log(`\nBuilt ${enPages.length} EN pages → dist/en/`);
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
}

copyDir(ASSETS_DIR, join(DIST, 'assets'));
copyDir(JS_DIR, join(DIST, 'js'));
