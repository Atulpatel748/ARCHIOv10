import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Picture from './Picture.jsx';

describe('Picture', () => {
  it('offers the AVIF first and keeps the JPEG as the fallback image', () => {
    const { container } = render(<Picture src="/images/projects/a/01.jpg" alt="A living room" width="1600" height="1200" loading="lazy" className="hero" />);
    const source = container.querySelector('picture > source');
    expect(source).toHaveAttribute('type', 'image/avif');
    expect(source).toHaveAttribute('srcset', '/images/projects/a/01.avif');
    const image = screen.getByRole('img', { name: 'A living room' });
    expect(image).toHaveAttribute('src', '/images/projects/a/01.jpg');
    // Everything an <img> needs still reaches the <img>, not the <source>.
    expect(image).toHaveAttribute('width', '1600');
    expect(image).toHaveAttribute('height', '1200');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveClass('hero');
  });

  it('keeps the empty alt of a decorative image', () => {
    const { container } = render(<Picture src="/images/projects/a/01.jpg" alt="" />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('renders a plain image when there is no AVIF twin', () => {
    const { container } = render(<Picture src="https://example.com/photo.jpg" alt="From elsewhere" />);
    expect(container.querySelector('picture')).toBeNull();
    expect(screen.getByRole('img', { name: 'From elsewhere' })).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });
});
