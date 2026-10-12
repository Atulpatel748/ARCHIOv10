import { Link } from 'react-router';
import CtaBand from '../components/common/CtaBand.jsx';
import Button from '../components/ui/Button.jsx';
import HeroPortal from '../components/common/HeroPortal.jsx';
import WordReveal from '../components/common/WordReveal.jsx';
import { PROJECT_CATEGORIES, labelFor } from '@archio/shared/constants';
import Seo from '../components/common/Seo.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ArrowIcon from '../components/ui/ArrowIcon.jsx';
import { APPROACH, HOME_CATEGORIES } from '../constants/content.js';
import { ROUTES } from '../constants/routes.js';
import { SITE } from '../constants/site.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import { useRevealItems } from '../hooks/useRevealItems.js';
import { PROJECTS, featuredProjects } from '../services/projects.js';
import { formatProjectLocation } from '../utils/format.js';
import Picture from '../components/common/Picture.jsx';

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  telephone: SITE.phone,
  logo: `${SITE.url}${SITE.logo}`,
  description: SITE.tagline,
  address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
  parentOrganization: { '@type': 'Organization', name: 'Beracah Trading' },
  sameAs: SITE.social.map((item) => item.href),
};

// The portfolio is static, so the featured list is worked out once rather than on every scroll-driven render.
const FEATURED = featuredProjects(PROJECTS);

export default function HomePage() {
  const featuredReveal = useRevealOnScroll();
  const doReveal = useRevealOnScroll();
  const processReveal = useRevealOnScroll();
  const featuredItems = useRevealItems();
  const processItems = useRevealItems();

  return (
    <>
      <Seo
        description="Archió is a Dubai interior design consultancy for residential, commercial and mixed-use spaces, and a unit of Beracah Trading."
        path="/"
        jsonLd={ORGANIZATION}
      />

      {/* Full-screen morphing photo gallery behind the clear header. The h1 (the wordmark) sits inside it. */}
      <HeroPortal projects={FEATURED} />

      <section id="home-approach" ref={processReveal} className="screen screen--center section container section--ruled section--soft reveal-section" aria-labelledby="process-title">
        <div className="split split--divided">
          <div className="stack">
            <p className="eyebrow t-label">{APPROACH.eyebrow}</p>
            <WordReveal as="h2" id="process-title" text={APPROACH.heading} className="t-h2 t-serif" />
            <p className="t-lead">{APPROACH.principle}</p>
            <p>{APPROACH.intro}</p>
            <Link className="link link--quiet" to={ROUTES.services}>View our services <ArrowIcon /></Link>
          </div>
          <div className="stack">
            <p className="eyebrow t-label">{APPROACH.lead}</p>
            <ol ref={processItems} className="toc toc--home">
              {APPROACH.points.map((point, index) => (
                <li key={point} className="toc-row">
                  <span className="toc-row__num">{String(index + 1).padStart(2, '0')}</span>
                  <p>{point}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section ref={featuredReveal} className="screen screen--center home-featured section container section--ruled section--soft reveal-section" aria-labelledby="featured-title">
        <div className="section__head section__head--stacked">
          <h2 id="featured-title" className="t-h2 t-serif">Selected projects</h2>
          <Link className="link link--quiet" to={ROUTES.projects}>View all projects <ArrowIcon /></Link>
        </div>
        {FEATURED.length === 0 ? (
          <EmptyState title="Projects are coming soon">We are preparing our portfolio. Check back shortly.</EmptyState>
        ) : (
          <ol ref={featuredItems} className="project-rows">
            {FEATURED.slice(0, 3).map((project) => (
              <li key={project.slug}>
                <Link className="project-row" to={ROUTES.project(project.slug)}>
                  <span className="project-row__media">
                    <Picture src={project.coverImage.url} alt="" width="1600" height="1200" loading="lazy" decoding="async" />
                  </span>
                  <span className="project-row__text">
                    <span className="project-row__meta t-label">
                      {project.category && <span>{labelFor(PROJECT_CATEGORIES, project.category)}</span>}
                    </span>
                    <h3 className="project-row__name">{project.title}</h3>
                    <span className="t-small t-muted">{formatProjectLocation(project)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* We do: type only. "We" and "do" frame the categories from the top left and the bottom right, and
          draw apart while the section scrolls in as the names gather (CSS scroll-driven, transform only). */}
      <section ref={doReveal} className="screen do-type section--ruled section--soft reveal-section" aria-labelledby="do-title">
        <h2 id="do-title" className="do-type__big">
          <span className="do-type__word do-type__word--start">We</span> <span className="do-type__word do-type__word--end">do</span>
        </h2>
        <div className="do-type__center">
          <ul className="do-type__list">
            {HOME_CATEGORIES.map((category, index) => (
              <li key={category.value} style={{ '--i': index }}>
                <Link className="do-row" to={`${ROUTES.projects}?category=${category.value}`}>{category.label}</Link>
              </li>
            ))}
          </ul>
          <Button to={ROUTES.projects} variant="secondary" size="sm">View all projects</Button>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
