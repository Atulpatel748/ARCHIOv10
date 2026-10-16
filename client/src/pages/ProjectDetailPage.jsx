import { Link, useParams } from 'react-router';
import { PROJECT_CATEGORIES, PROJECT_STYLES, labelFor } from '@archio/shared/constants';
import CtaBand from '../components/common/CtaBand.jsx';
import ProjectCard from '../components/common/ProjectCard.jsx';
import Seo from '../components/common/Seo.jsx';
import { ROUTES } from '../constants/routes.js';
import { PROJECTS, getProject, relatedProjects } from '../services/projects.js';
import { formatArea, formatProjectLocation, paragraphs } from '../utils/format.js';
import { NotFoundContent } from './NotFoundPage.jsx';
import Picture from '../components/common/Picture.jsx';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import { useRevealItems } from '../hooks/useRevealItems.js';

function splitProjectTitle(title) {
  const words = title.trim().split(/\s+/);
  if (words.length < 2 || title.length <= 18) return [title];

  let bestSplit = 1;
  let smallestDifference = Infinity;
  for (let index = 1; index < words.length; index += 1) {
    const firstLine = words.slice(0, index).join(' ');
    const secondLine = words.slice(index).join(' ');
    const difference = Math.abs(firstLine.length - secondLine.length);
    if (difference < smallestDifference) {
      bestSplit = index;
      smallestDifference = difference;
    }
  }

  return [words.slice(0, bestSplit).join(' '), words.slice(bestSplit).join(' ')];
}

function ProjectDetail({ project, related, next }) {
  const relatedReveal = useRevealOnScroll();
  const galleryReveal = useRevealOnScroll();
  const galleryItems = useRevealItems();
  const relatedItems = useRevealItems();
  const titleLines = splitProjectTitle(project.title);
  // Two photos open the gallery; the concept statement comes after them, then the rest.
  const before = project.gallery.slice(0, 2);
  const after = project.gallery.slice(2);
  const photo = (image) => (
    <figure key={image.url}>
      <Picture src={image.url} alt={image.alt} width="1600" height="1200" sizes="100vw" loading="lazy" decoding="async" />
    </figure>
  );
  return (
    <article className="project-page">
      <Seo title={project.title} description={project.summary} path={ROUTES.project(project.slug)} image={project.coverImage.url} />
      {/* After the YODEZEEN project pages: the cover full screen with a small name at its foot, a light strip of facts
          spread across the width, photos edge to edge, a centred "Concept" statement part way down, and the next project
          announced in the centre above its own photo. The whole cover carries project-hero-wrap, which keeps the header
          clear over it. */}
      <header className="project-hero-wrap yz-hero">
        <Picture className="yz-hero__photo" src={project.coverImage.url} alt={project.coverImage.alt} width="1600" height="1200" sizes="100vw" loading="eager" fetchPriority="high" />
        <div className="container yz-hero__bar">
          <h1 className="project-hero__title">
            {/* The space between the lines keeps the title's text whole ("Dubai Marina Residence") for copy, search and reader views. */}
            {titleLines.map((line, index) => (
              <span key={index} className="project-hero__line">
                {index > 0 && ' '}
                {line}
              </span>
            ))}
          </h1>
          <p className="t-label">{labelFor(PROJECT_CATEGORIES, project.category)}</p>
        </div>
      </header>
      <section className="yz-facts" aria-label="Project facts">
        <dl id="project-facts" className="container facts">
          <div><dt>Location</dt><dd>{formatProjectLocation(project)}</dd></div>
          {project.year && <div><dt>Year</dt><dd>{project.year}</dd></div>}
          <div><dt>Area</dt><dd>{formatArea(project.areaSqm)}</dd></div>
          <div><dt>Category</dt><dd>{labelFor(PROJECT_CATEGORIES, project.category)}</dd></div>
          {project.style && <div><dt>Style</dt><dd>{labelFor(PROJECT_STYLES, project.style)}</dd></div>}
        </dl>
      </section>
      {project.gallery.length > 0 && (
        <div className="gallery">
          {before.map(photo)}
        </div>
      )}
      <section className="container yz-concept" aria-label="Concept">
        <p className="t-label">Concept</p>
        <p className="yz-concept__statement">{project.summary}</p>
        <div className="yz-concept__copy">
          {paragraphs(project.description).map((text, index) => <p key={index}>{text}</p>)}
        </div>
      </section>
      {after.length > 0 && (
        <section ref={galleryReveal} className="gallery reveal-section" aria-label="Gallery">
          <div ref={galleryItems}>{after.map(photo)}</div>
        </section>
      )}
      {related.length > 0 && (
        <section ref={relatedReveal} className="screen screen--center container section reveal-section" aria-labelledby="related-title">
          <h2 id="related-title" className="t-h2 section__head">
            Similar projects
          </h2>
          <div ref={relatedItems} className="project-grid project-grid--dense">
            {related.map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
          </div>
        </section>
      )}
      {next && (
        <Link to={ROUTES.project(next.slug)} className="yz-next">
          <span className="container yz-next__text">
            <span className="t-label">Next project</span>{' '}
            <span className="yz-next__title">{next.title}</span>{' '}
            <span className="yz-next__kind">{labelFor(PROJECT_CATEGORIES, next.category)}</span>
          </span>
          <Picture className="yz-next__photo" src={next.coverImage.url} alt="" width="1600" height="1200" sizes="100vw" loading="lazy" decoding="async" />
        </Link>
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
