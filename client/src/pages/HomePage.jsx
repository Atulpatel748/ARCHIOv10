import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import CtaBand from '../components/common/CtaBand.jsx';
import Button from '../components/ui/Button.jsx';
import HeroPortal from '../components/common/HeroPortal.jsx';
import { PROJECT_CATEGORIES, labelFor } from '@archio/shared/constants';
import Seo from '../components/common/Seo.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ArrowIcon from '../components/ui/ArrowIcon.jsx';
import { APPROACH, HOME_CATEGORIES } from '../constants/content.js';
import { ROUTES } from '../constants/routes.js';
import { SITE } from '../constants/site.js';
import { useScrollSequence } from '../hooks/useScrollSequence.js';
import { PROJECTS, featuredProjects } from '../services/projects.js';
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


// Motion for React (formerly Framer Motion): keep the page visible for SSR/hydration,
// then enhance it with scroll reveals and small gesture responses after mount.
const MotionLink = motion.create(Link);
const motionEase = [0.22, 1, 0.36, 1];
const revealUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: motionEase } },
};
const revealGroup = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};
const projectRowReveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.64, ease: motionEase } },
};
const cardSpring = { type: 'spring', stiffness: 360, damping: 28 };
const revealViewport = { once: true, amount: 0.14, margin: '0px 0px -7% 0px' };

const FEATURED = featuredProjects(PROJECTS);
const SELECTED = FEATURED.slice(0, 3);
const projectCategory = (project) => labelFor(PROJECT_CATEGORIES, project.category);

export default function HomePage() {
  const doSequence = useScrollSequence();
  const prefersReducedMotion = useReducedMotion();
  const [motionReady, setMotionReady] = useState(false);
  useEffect(() => setMotionReady(true), []);
  const motionEnabled = motionReady && prefersReducedMotion !== true;
  const enterState = motionEnabled ? 'hidden' : false;
  const leadProject = SELECTED[0];
  const supportingProjects = SELECTED.slice(1);

  return (
    <>
      <Seo
        description="Archió is a Dubai interior design consultancy for residential, commercial and mixed-use spaces, and a unit of Beracah Trading."
        path="/"
        jsonLd={ORGANIZATION}
      />

      {/* The established ARCHIÓ wordmark/hero treatment stays intact. The rest of the page takes a new editorial direction. */}
      <HeroPortal projects={FEATURED} />

      <motion.section className="home-manifesto container" aria-labelledby="home-manifesto-title" variants={revealGroup} initial={enterState} whileInView={motionEnabled ? "visible" : undefined} viewport={revealViewport}>
        <motion.div className="home-manifesto__rail t-label" variants={revealUp}>
          <span>ARCHIÓ / STUDIO NOTE 01</span>
          <span>Dubai · UAE</span>
        </motion.div>
        <motion.div className="home-manifesto__body" variants={revealUp}>
          <motion.h2 id="home-manifesto-title" variants={revealUp}>A space should feel <em>inevitable.</em></motion.h2>
          <motion.div className="home-manifesto__copy" variants={revealUp}>
            <p>{APPROACH.intro}</p>
            <Link className="link link--quiet" to={ROUTES.about}>Meet the studio <ArrowIcon /></Link>
          </motion.div>
        </motion.div>
      </motion.section>

      <section className="home-work container reveal-section" aria-labelledby="featured-title">
        <motion.div className="home-work__heading" variants={revealUp} initial={enterState} whileInView={motionEnabled ? "visible" : undefined} viewport={revealViewport}>
          <div>
            <p className="t-label">01 — Selected work</p>
            <h2 id="featured-title" className="home-work__title">Selected work</h2>
          </div>
          <Link className="home-work__all link link--quiet" to={ROUTES.projects}>Explore the full portfolio <ArrowIcon /></Link>
        </motion.div>

        {FEATURED.length === 0 ? (
          <EmptyState title="Projects are coming soon">We are preparing our portfolio. Check back shortly.</EmptyState>
        ) : (
          <motion.div className="home-work__layout" variants={revealGroup} initial={enterState} whileInView={motionEnabled ? "visible" : undefined} viewport={revealViewport}>
            {leadProject && (
              <MotionLink className="home-feature" to={ROUTES.project(leadProject.slug)} variants={projectRowReveal} whileHover={motionEnabled ? { y: -4, transition: cardSpring } : undefined} whileTap={motionEnabled ? { scale: 0.99 } : undefined}>
                <span className="home-feature__image">
                  <Picture src={leadProject.coverImage.url} alt="" width="1800" height="1400" sizes="(min-width: 1024px) 66vw, 100vw" loading="lazy" decoding="async" />
                  <span className="home-feature__index">01 / {String(SELECTED.length).padStart(2, '0')}</span>
                  <motion.span className="home-feature__open" aria-hidden="true" whileHover={motionEnabled ? { x: 4, y: -3 } : undefined} transition={cardSpring}><ArrowIcon /></motion.span>
                </span>
                <span className="home-feature__caption">
                  <span className="t-label">{projectCategory(leadProject)} <span aria-hidden="true">/</span> {leadProject.city.split(',')[0]}</span>
                  <span className="home-feature__name">{leadProject.title}</span>
                </span>
              </MotionLink>
            )}

            <motion.ol className="home-project-index" aria-label="More selected projects" variants={revealGroup}>
              {supportingProjects.length === 0 && (
                <li className="home-project-index__empty">More work is in progress.</li>
              )}
              {supportingProjects.map((project, index) => (
                <motion.li key={project.slug} variants={projectRowReveal}>
                  <MotionLink className="home-index-row" to={ROUTES.project(project.slug)} whileHover={motionEnabled ? { y: -3, transition: cardSpring } : undefined} whileTap={motionEnabled ? { scale: 0.995 } : undefined}>
                    <span className="home-index-row__top">
                      <span className="home-index-row__number">{String(index + 2).padStart(2, '0')}</span>
                      <span className="t-label">{projectCategory(project)}</span>
                      <motion.span className="home-index-row__arrow" aria-hidden="true" whileHover={motionEnabled ? { x: 3, y: -2 } : undefined} transition={cardSpring}><ArrowIcon /></motion.span>
                    </span>
                    <span className="home-index-row__image">
                      <Picture src={project.coverImage.url} alt="" width="900" height="680" sizes="(min-width: 1024px) 24vw, 45vw" loading="lazy" decoding="async" />
                    </span>
                    <span className="home-index-row__details">
                      <span className="home-index-row__name">{project.title}</span>
                      <span className="t-small t-muted">{project.city.split(',')[0]}</span>
                    </span>
                  </MotionLink>
                </motion.li>
              ))}
              <motion.li className="home-project-index__footer" variants={projectRowReveal}>
                <Link className="link link--quiet" to={ROUTES.projects}>All projects <ArrowIcon /></Link>
              </motion.li>
            </motion.ol>
          </motion.div>
        )}
      </section>

      {/* Category index: a concise bridge from selected projects to the wider portfolio. */}
      <section ref={doSequence} className="do-type section--ruled section--soft" aria-labelledby="do-title">
        <div className="do-type__stage">
          <h2 id="do-title" className="do-type__big">
            <span className="do-type__word do-type__word--start">We</span> <span className="do-type__word do-type__word--end">design</span>
          </h2>
          <div className="do-type__center">
            <ul className="do-type__list">
              {HOME_CATEGORIES.map((category, index) => (
                <li key={category.value} style={{ '--i': index }}>
                  <Link className="do-row" to={`${ROUTES.projects}?category=${category.value}`}>{category.label}</Link>
                </li>
              ))}
            </ul>
            <motion.div whileHover={motionEnabled ? { y: -2 } : undefined} whileTap={motionEnabled ? { scale: 0.98 } : undefined} transition={cardSpring}><Button className="do-type__button" to={ROUTES.projects} size="sm">View all projects</Button></motion.div>
          </div>
        </div>
      </section>



      <CtaBand />
    </>
  );
}
