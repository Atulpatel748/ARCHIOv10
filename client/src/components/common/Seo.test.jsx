import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Seo from './Seo.jsx';

const meta = (selector) => document.head.querySelector(selector);

describe('Seo', () => {
  it('sets title, description, canonical and social tags', () => {
    render(<Seo title="Projects" description="All our work." path="/projects" />);
    expect(document.title).toBe('Projects | Archió');
    expect(meta('meta[name="description"]')).toHaveAttribute('content', 'All our work.');
    expect(meta('link[rel="canonical"]').getAttribute('href')).toMatch(/\/projects$/);
    expect(meta('meta[property="og:title"]')).toHaveAttribute('content', 'Projects | Archió');
    expect(meta('meta[name="robots"]')).toBeNull();
  });

  it('uses a page-specific social image when one is given', () => {
    render(<Seo title="Project" description="A project." path="/projects/x" image="/images/projects/x/01.jpg" />);
    expect(meta('meta[property="og:image"]').getAttribute('content')).toMatch(/\/images\/projects\/x\/01\.jpg$/);
  });

  it('marks private pages noindex and drops the canonical link', () => {
    render(<Seo title="Private page" noindex description="Private." path="/private" />);
    expect(meta('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    expect(meta('link[rel="canonical"]')).toBeNull();
  });

  it('escapes markup characters in JSON-LD and cleans up on unmount', () => {
    const { unmount } = render(<Seo title="x" description="y" jsonLd={{ name: '</script><script>alert(1)</script>' }} />);
    const script = meta('script[type="application/ld+json"]');
    expect(script.textContent).not.toContain('<');
    expect(JSON.parse(script.textContent).name).toContain('script');
    unmount();
    expect(meta('script[type="application/ld+json"]')).toBeNull();
  });
});
