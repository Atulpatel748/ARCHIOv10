import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = import.meta.dirname;
const sheets = readdirSync(dir)
  .filter((name) => name.endsWith('.css'))
  .map((name) => ({ name, lines: readFileSync(join(dir, name), 'utf8').split('\n') }));

// For a line inside a block, the header of the top-level block that contains it.
function topLevelHeader(lines, index) {
  for (let i = index; i >= 0; i -= 1) {
    const line = lines[i];
    if (line && !/^[\s}]/.test(line)) return line;
  }
  return '';
}

describe('interaction CSS', () => {
  it('only applies :hover styles on devices that can hover, so taps do not leave them stuck on', () => {
    const ungated = [];
    for (const { name, lines } of sheets) {
      lines.forEach((line, i) => {
        if (!line.includes(':hover') || line.trim().startsWith('/*')) return;
        if (!topLevelHeader(lines, i).includes('(hover: hover)')) ungated.push(`${name}:${i + 1} ${line.trim()}`);
      });
    }
    expect(ungated).toEqual([]);
  });

  it('keeps every hover effect available to keyboard users through :focus-visible', () => {
    const typography = readFileSync(join(dir, 'typography.css'), 'utf8');
    expect(typography).toMatch(/a:focus-visible > \.roll > span/);
    const projects = readFileSync(join(dir, 'projects.css'), 'utf8');
    expect(projects).toMatch(/\.project-card:focus-visible \.project-card__media img/);
    const home = readFileSync(join(dir, 'home.css'), 'utf8');
    expect(home).toMatch(/\.do-row:focus-visible/);
  });

  it('gives buttons, chips and pagination a pressed state', () => {
    const components = readFileSync(join(dir, 'components.css'), 'utf8');
    for (const selector of ['.btn:active', '.chip:active', '.pagination__page:active']) {
      expect(components).toContain(selector);
    }
    expect(components).toMatch(/:active[^{]*\{[^}]*transform: scale\(0\.97\)/s);
  });

  it('makes links and footer rows at least 44px to hit on touch screens', () => {
    const site = readFileSync(join(dir, 'site.css'), 'utf8');
    const block = site.slice(site.indexOf('@media (pointer: coarse)'));
    expect(block).toMatch(/\.link::after[^}]*inset: -15px/s);
    expect(block).toMatch(/\.site-footer a[^}]*min-height: 44px/s);
  });

  it('grows the compact chips and small buttons to 44px on touch screens', () => {
    const components = readFileSync(join(dir, 'components.css'), 'utf8');
    expect(components).toMatch(/@media \(pointer: coarse\) \{\s*\.chip,\s*\.btn--sm \{\s*min-height: 44px/);
  });

  it('uses a strong ease-out curve and releases will-change after a reveal', () => {
    const tokens = readFileSync(join(dir, 'tokens.css'), 'utf8');
    expect(tokens).toContain('--ease-out: cubic-bezier(0.23, 1, 0.32, 1)');
    const base = readFileSync(join(dir, 'base.css'), 'utf8');
    expect(base).toMatch(/\.reveal--visible \{[^}]*will-change: auto/s);
  });
});
