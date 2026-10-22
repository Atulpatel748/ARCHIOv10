import { Link, useParams } from 'react-router';
import { useEffect } from 'react';
import { PROJECT_CATEGORIES, PROJECT_STYLES, labelFor } from '@archio/shared/constants';
import CtaBand from '../components/common/CtaBand.jsx';
import ProjectCard from '../components/common/ProjectCard.jsx';
import Seo from '../components/common/Seo.jsx';
import { ROUTES } from '../constants/routes.js';
import { PROJECTS, getProject, relatedProjects } from '../services/projects.js';
import { formatArea, formatProjectLocation, paragraphs } from '../utils/format.js';
import { NotFoundContent } from './NotFoundPage.jsx';
import Picture from '../components/common/Picture.jsx';
import { ProjectBrief } from '../components/common/Additions.jsx';
import ArrowIcon from '../components/ui/ArrowIcon.jsx';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import { useRevealItems } from '../hooks/useRevealItems.js';

// The summary is the concept heading; a write-up that opens with the very same sentence would print it twice.
const withoutLead = (text, lead) => (text.startsWith(lead) ? text.slice(lead.length).trim() : text);

function ProjectDetail({ project, related, next }) {
  const relatedReveal = useRevealOnScroll();
  const galleryReveal = useRevealOnScroll();
  const galleryItems = useRevealItems();
  const relatedItems = useRevealItems();
  const position = Math.max(0, PROJECTS.findIndex((item) => item.slug === project.slug)) + 1;
  const nextPosition = next ? Math.max(0, PROJECTS.findIndex((item) => item.slug === next.slug)) + 1 : 0;
  // Always begin a project detail at its own introduction, never at the previous page's scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [project.slug]);

  // Two photos open the gallery; the concept statement comes after them, then the rest.
  const before = project.gallery.slice(0, 2);
  const after = project.gallery.slice(2);
  const photo = (image) => (
    <figure key={image.url}>
      <Picture src={image.url} alt={image.alt} width="1600" height="1200" sizes="(min-width: 768px) 50vw, 100vw" loading="lazy" decoding="async" />
    </figure>
  );
  return (
    <article className="project-page">
      <Seo title={project.title} description={project.summary} path={ROUTES.project(project.slug)} image={project.coverImage.url} />

      {/* Unlike the home hero, a project opens as an editorial case study: clear context first, imagery second. */}
      <header className="project-detail-intro">
        <div className="container">
          <div className="project-detail-intro__rail">
            <Link className="project-detail-intro__back" to={ROUTES.projects}>
              <ArrowIcon /> <span>All projects</span>
            </Link>
            <span className="t-label">PROJECT {String(position).padStart(2, '0')} <i aria-hidden="true">/</i> {String(PROJECTS.length).padStart(2, '0')}</span>
          </div>
          <div className="project-detail-intro__main">
            <div className="project-detail-intro__heading">
              <p className="project-detail-intro__category t-label">{labelFor(PROJECT_CATEGORIES, project.category)} <span aria-hidden="true">/</span> {project.city.split(',')[0]}</p>
              <h1 className="project-detail-intro__title">{project.title}</h1>
            </div>
            <div className="project-detail-intro__aside">
              <p className="t-label">PROJECT OVERVIEW</p>
              <p className="project-detail-intro__location">{formatProjectLocation(project)}</p>
              <p className="project-detail-intro__cue">Scroll to explore <span aria-hidden="true">↓</span></p>
            </div>
          </div>
        </div>
      </header>

      <figure className="project-cover project-cover--editorial">
        <Picture className="project-cover__photo" src={project.coverImage.url} alt={project.coverImage.alt} width="1800" height="1200" sizes="(min-width: 1440px) 1280px, calc(100vw - 2 * var(--gutter))" loading="eager" fetchPriority="high" />
        <figcaption className="project-cover__caption container">
          <span className="t-label">{String(position).padStart(2, '0')} / FEATURED PROJECT</span>
          <span className="t-label">{labelFor(PROJECT_CATEGORIES, project.category)} <i aria-hidden="true">/</i> {project.city.split(',')[0]}</span>
        </figcaption>
      </figure>

      <section className="project-facts" aria-label="Project facts">
        <dl id="project-facts" className="container facts">
          <div><dt>Location</dt><dd>{formatProjectLocation(project)}</dd></div>
          {project.year && <div><dt>Year</dt><dd>{project.year}</dd></div>}
          <div><dt>Area</dt><dd>{formatArea(project.areaSqm)}</dd></div>
          <div><dt>Category</dt><dd>{labelFor(PROJECT_CATEGORIES, project.category)}</dd></div>
          {project.style && <div><dt>Style</dt><dd>{labelFor(PROJECT_STYLES, project.style)}</dd></div>}
        </dl>
      </section>
      {project.gallery.length > 0 && (
        <div className="gallery gallery__list">
          {before.map(photo)}
        </div>
      )}
      <section className="container project-concept" aria-labelledby="project-concept-title">
        <p className="t-label">Concept</p>
        <h2 id="project-concept-title" className="project-concept__statement">{project.summary}</h2>
        <div className="project-concept__copy">
          {paragraphs(withoutLead(project.description, project.summary)).map((text, index) => <p key={index}>{text}</p>)}
        </div>
      </section>
      <ProjectBrief />
      {after.length > 0 && (
        <section ref={galleryReveal} className="gallery reveal-section" aria-label="Gallery">
          <div ref={galleryItems} className="gallery__list">{after.map(photo)}</div>
        </section>
      )}
      {related.length > 0 && (
        <section ref={relatedReveal} className="screen screen--center container section reveal-section" aria-labelledby="related-title">
          <div className="project-related__heading">
            <p className="t-label">KEEP EXPLORING</p>
            <h2 id="related-title" className="t-h2 section__head">Related projects</h2>
          </div>
          <div ref={relatedItems} className="project-grid project-grid--dense">
            {related.map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
          </div>
        </section>
      )}
      {next && (
        <section className="project-next-section" aria-label="Continue to next project">
          <div className="container project-next-section__head">
            <p className="t-label">Continue exploring</p>
            <span className="t-label">{String(nextPosition).padStart(2, '0')} <i aria-hidden="true">/</i> {String(PROJECTS.length).padStart(2, '0')}</span>
          </div>
          <Link
            to={ROUTES.project(next.slug)}
            className="project-next"
          >
            <span className="project-next__body">
              <span className="project-next__eyebrow t-label">Next project</span>{' '}
              <span className="project-next__title">{next.title}</span>{' '}
              <span className="project-next__kind">{labelFor(PROJECT_CATEGORIES, next.category)} <i aria-hidden="true">/</i> {next.city.split(',')[0]}</span>
              <span className="project-next__bottom">
                <span>View project</span>
                <span className="project-next__arrow" aria-hidden="true"><ArrowIcon /></span>
              </span>
            </span>
            <span className="project-next__media">
              <Picture className="project-next__photo" src={next.coverImage.url} alt="" width="1200" height="1000" sizes="(min-width: 1024px) 44vw, 100vw" loading="lazy" decoding="async" />
              <span className="project-next__media-label t-label" aria-hidden="true">{String(nextPosition).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}</span>
            </span>
          </Link>
        </section>
      )}
      <CtaBand title="Planning something similar?" />
    </article>
  );
}

// The one after this in portfolio order, wrapping round to the first; none when the portfolio has a single project.
function nextProject(project) {
  const index = PROJECTS.findIndex((item) => item.slug === project.slug);
  return PROJECTS.length > 1 ? PROJECTS[(index + 1) % PROJECTS.length] : null;
}

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = getProject(PROJECTS, slug);
  if (!project) {
    return (
      <>
        <Seo title="Project not found" noindex description="This project could not be found." path={ROUTES.project(slug)} />
        <NotFoundContent what="project" />
      </>
    );
  }
  // keyed by slug so moving from one project to a similar one starts the page afresh (reveal animations, scroll position)
  return <ProjectDetail key={project.slug} project={project} related={relatedProjects(PROJECTS, project)} next={nextProject(project)} />;
}
