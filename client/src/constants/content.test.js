import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECT_CATEGORY_VALUES } from '@archio/shared/constants';
import { describe, expect, it } from 'vitest';
import { ABOUT, HOME_CATEGORIES, SERVICES, TEAM, WHY_CHOOSE_US } from './content.js';
import { NAV_LINKS, SITE } from './site.js';

const here = dirname(fileURLToPath(import.meta.url));
const publicFile = (url) => resolve(here, '../../public', `.${url}`);

describe('studio content', () => {
  it('lists the six consultancy services from the company profile', () => {
    expect(SERVICES.items).toHaveLength(6);
    expect(new Set(SERVICES.items.map((service) => service.title)).size).toBe(6);
    for (const service of SERVICES.items) {
      expect(existsSync(publicFile(service.image)), service.image).toBe(true);
      expect(service.description.trim().length).toBeGreaterThan(20);
    }
  });

  it('names every project category once in the home page\'s "We design" section', () => {
    expect(HOME_CATEGORIES.map((c) => c.value).sort()).toEqual([...PROJECT_CATEGORY_VALUES].sort());
  });

  it('has portraits for the team, the logo mark and the share image', () => {
    expect(TEAM).toHaveLength(2);
    for (const person of TEAM) expect(existsSync(publicFile(person.image)), person.image).toBe(true);
    expect(existsSync(publicFile(SITE.logo))).toBe(true);
    expect(existsSync(publicFile('/og-image.png'))).toBe(true);
  });

  it('carries the studio contact details without invented hours or a street address', () => {
    expect(SITE).toMatchObject({ name: 'Archi\u00F3', email: 'info@beracahlogistics.com', phone: '+971 55 654 1410' });
    expect(SITE).not.toHaveProperty('hours');
    expect(SITE.address).toBe('Dubai, United Arab Emirates'); // city level only, no street address
  });

  it('has no per-service navigation, and copy for every About section', () => {
    expect(NAV_LINKS.map((l) => l.to)).toEqual(['/projects', '/services', '/about', '/contact']);
    expect(ABOUT.paragraphs).toHaveLength(3);
    expect(WHY_CHOOSE_US.points).toHaveLength(5);
  });
});
