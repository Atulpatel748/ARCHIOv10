import { useState, useSyncExternalStore } from 'react';
import PageHead from '../components/common/PageHead.jsx';
import Picture from '../components/common/Picture.jsx';
import Seo from '../components/common/Seo.jsx';
import { SERVICES } from '../constants/content.js';
import { ROUTES } from '../constants/routes.js';
import { useRevealItems } from '../hooks/useRevealItems.js';

// Wide screens show one large photo beside the list; narrower ones keep the open-in-place accordion.
const WIDE = '(min-width: 1024px)';
const watchWide = (notify) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener?.('change', notify);
  return () => query.removeEventListener?.('change', notify);
};
const isWide = () => window.matchMedia(WIDE).matches;

export default function ServicesPage() {
  const rows = useRevealItems();
  const wide = useSyncExternalStore(watchWide, isWide, () => false);
  const [openService, setOpenService] = useState(null);
  const [activeService, setActiveService] = useState(0);

  return (
    <>
      <Seo
        title="Services"
        description="Consultancy-based interior design in Dubai: concept development, space planning, material and finish selection, design review and project coordination."
        path={ROUTES.services}
      />
      <div className="screen">
        <PageHead title="Services" display>
          <p className="t-lead prose">{SERVICES.lead}</p>
        </PageHead>
        <section className="container section--tight" aria-label="All services">
          <div className={wide ? 'services-split' : undefined}>
            <ol ref={rows} className="toc toc--large">
              {SERVICES.items.map((service, index) => (
                <li
                  key={service.title}
                  className={`toc-row${wide && activeService === index ? ' is-active' : ''}`}
                  onMouseEnter={wide ? () => setActiveService(index) : undefined}
                >
                  <span className="toc-row__num">{String(index + 1).padStart(2, '0')}</span>
                  <div className="service-row">
                    {wide ? (
                      <h2 className="toc-row__title">{service.title}</h2>
                    ) : (
                      <>
                        <h2 className="toc-row__title">
                          <button
                            id={`service-trigger-${index}`}
                            className="service-trigger"
                            type="button"
                            aria-expanded={openService === index}
                            aria-controls={`service-panel-${index}`}
                            onClick={() => setOpenService(openService === index ? null : index)}
                          >
                            <span>{service.title}</span>
                            <span className="service-trigger__indicator" aria-hidden="true" />
                          </button>
                        </h2>
                        <div
                          id={`service-panel-${index}`}
                          className="service-panel"
                          role="region"
                          aria-labelledby={`service-trigger-${index}`}
                          hidden={openService !== index}
                        >
                          {openService === index && (
                            <Picture
                              src={service.image}
                              alt={service.alt}
                              width="1600"
                              height="900"
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            {wide && (
              // Decorative: the heading beside each photo already names the service. All six sit stacked and
              // cross-fade, so a photo is never loaded on hover.
              <div className="services-photo" aria-hidden="true">
                {SERVICES.items.map((service, index) => (
                  <Picture
                    key={service.image}
                    className={activeService === index ? 'is-active' : undefined}
                    src={service.image}
                    alt=""
                    width="1600"
                    height="900"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
