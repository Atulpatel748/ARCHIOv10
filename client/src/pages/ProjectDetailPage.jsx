import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
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

function ProjectDetail({ project, related }) {
  const galleryReveal = useRevealOnScroll();
  const relatedReveal = useRevealOnScroll();
  const galleryItems = useRevealItems();
  const relatedItems = useRevealItems();
  const titleRef = useRef(null);
  const titleLines = splitProjectTitle(project.title);

  useEffect(() => {
    const title = titleRef.current;
    const header = document.querySelector('.site-header');
    if (!title || !header) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (motionPreference.matches) {
        title.style.removeProperty('opacity');
        return;
      }

      const titleBounds = title.getBoundingClientRect();
      const headerBottom = header.getBoundingClientRect().bottom;
      const opacity = Math.min(Math.max((titleBounds.top - headerBottom) / titleBounds.height, 0), 1);
      title.style.opacity = String(opacity);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    motionPreference.addEventListener('change', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      motionPreference.removeEventListener('change', scheduleUpdate);
      window.cancelAnimationFrame(frame);
      title.style.removeProperty('opacity');
    };
  }, []);

  return (
    <article>
      <Seo title={project.title} description={project.summary} path={ROUTES.project(project.slug)} image={project.coverImage.url} />
      {/* Full-bleed cover photo with the title set over it, matching the home hero. */}
      <header className="project-hero-wrap">
        <Picture
          className="project-hero"
          src={project.coverImage.url}
          alt={project.coverImage.alt}
          width="1600"
          height="1200"
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
        />
        <div className="project-hero__overlay container stack">
          <h1 ref={titleRef} className="project-hero__title">
            {titleLines.map((line) => (
              <span key={line} className="project-hero__line">{line}</span>
            ))}
          </h1>
        </div>
      </header>
      <div className="screen screen--center">
        <div id="project-facts" className="container section--tight">
          <dl className="facts">
            <div><dt>Location</dt><dd>{formatProjectLocation(project)}</dd></div>
            {project.year && <div><dt>Year</dt><dd>{project.year}</dd></div>}
            <div><dt>Area</dt><dd>{formatArea(project.areaSqm)}</dd></div>
            <div><dt>Category</dt><dd>{labelFor(PROJECT_CATEGORIES, project.category)}</dd></div>
            {project.style && <div><dt>Style</dt><dd>{labelFor(PROJECT_STYLES, project.style)}</dd></div>}
          </dl>
        </div>
        <div className="container section--tight">
          <div className="prose project-copy">
            {paragraphs(project.description).map((text, index) => <p key={index}>{text}</p>)}
          </div>
        </div>
      </div>
      {project.gallery.length > 0 && (
        <section ref={galleryReveal} className="screen container section--tight reveal-section" aria-label="Gallery">
          <div ref={galleryItems} className="gallery">
            {project.gallery.map((image) => (
              <figure key={image.url}>
                <Picture src={image.url} alt={image.alt} width="1600" height="1200" sizes="(min-width: 1024px) 58vw, 100vw" loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section ref={relatedReveal} className="screen screen--center container section reveal-section" aria-labelledby="related-title">
          <h2 id="related-title" className="t-h2 section__head">Similar projects</h2>
          <div ref={relatedItems} className="project-grid project-grid--dense">
            {related.map((item) => <ProjectCard key={item.slug} project={item} />)}
          </div>
        </section>
      )}
      <CtaBand title="Planning something similar?" />
    </article>
  );
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
  return <ProjectDetail key={project.slug} project={project} related={relatedProjects(PROJECTS, project)} />;
}
