import { useLayoutEffect } from 'react';
import { Link } from 'react-router';
import Picture from '../components/common/Picture.jsx';
import Seo from '../components/common/Seo.jsx';
import ArrowIcon from '../components/ui/ArrowIcon.jsx';
import { SERVICES } from '../constants/content.js';
import { ROUTES } from '../constants/routes.js';
import { useRevealItems } from '../hooks/useRevealItems.js';
import { scrollToTop } from '../hooks/useSmoothScroll.js';

export default function ServicesPage() {
  // Services always opens at the start, even if the visitor left this page mid-scroll.
  useLayoutEffect(() => {
    scrollToTop();
    // Router scroll restoration can run during navigation as well; reset once more on the next frame.
    const frame = window.requestAnimationFrame(scrollToTop);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const rows = useRevealItems({ stagger: 45 });

  return (
    <>
      <Seo
        title="Services"
        description="Consultancy-based interior design in Dubai: concept development, space planning, material and finish selection, design review and project coordination."
        path={ROUTES.services}
      />
      <div className="screen services-page services-page--editorial">
        <header className="container services-a-hero">
          <div className="services-a__meta t-label">
            <span>Studio / Services</span>
            <span>Dubai · UAE</span>
          </div>
          <div className="services-a__hero-grid">
            <div className="services-a__hero-copy">
              <h1 className="services-a__title">
                Thoughtful design.
                <em>Practical direction.</em>
              </h1>
              <p className="services-a__lead">{SERVICES.lead}</p>
              <Link className="link services-a__cta-link" to={ROUTES.contact}>
                Discuss your project <ArrowIcon />
              </Link>
            </div>
            <figure className="services-a__hero-image">
              <Picture
                className="services-a__hero-photo"
                src="/images/projects/dubai-marina-residence/01.jpg"
                alt="A refined double-height living room with marble detailing and a sculptural chandelier"
                width="1800"
                height="1200"
                sizes="(min-width: 1440px) 720px, (min-width: 901px) 54vw, calc(100vw - 2 * var(--gutter))"
                loading="eager"
                fetchPriority="high"
              />
              <figcaption className="services-a__hero-caption">
                <span>01—06 / Capabilities in practice</span>
                <span>Residential · Commercial · Landscape</span>
              </figcaption>
            </figure>
          </div>
        </header>

        <section className="container services-a-capabilities" aria-labelledby="services-a-heading">
          <div className="services-a__kicker t-label">
            <span>Our capabilities / 01—06</span>
            <span>How we help</span>
          </div>
          <div className="services-a__section-head">
            <h2 id="services-a-heading">Clarity at every stage.</h2>
            <p>From the first brief to the final decision, we help make complex choices feel considered, connected and achievable.</p>
          </div>

          <div className="services-a__service-layout">
            <ol ref={rows} className="services-a__rows" aria-label="Our services">
              {SERVICES.items.map((service, index) => (
                <li className="services-a__row" key={service.title}>
                  <span className="services-a__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div className="services-a__service-copy">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                  <span className="services-a__row-arrow" aria-hidden="true">↗</span>
                </li>
              ))}
            </ol>

            <figure className="services-a__preview">
              <Picture
                className="services-a__preview-photo"
                src="/images/projects/dubai-marina-residence/02.jpg"
                alt="A considered mix of marble, dark stone, built-in shelving and warm architectural lighting"
                width="1400"
                height="1800"
                sizes="(min-width: 1440px) 510px, 35vw"
                loading="lazy"
              />
              <figcaption className="services-a__preview-caption">
                <span>Materiality / Light / Form</span>
                <span>02 — 06</span>
              </figcaption>
            </figure>
          </div>

          <aside className="services-a__bottom-cta">
            <h2>Good decisions begin with a conversation.</h2>
            <Link to={ROUTES.contact}>Let&rsquo;s talk <ArrowIcon /></Link>
          </aside>
        </section>
      </div>
    </>
  );
}
