import { Link } from 'react-router';
import { PROJECT_CATEGORIES, labelFor } from '@archio/shared/constants';
import { ROUTES } from '../../constants/routes.js';
import Picture from './Picture.jsx';
import ArrowIcon from '../ui/ArrowIcon.jsx';

export default function ProjectCard({ project, priority = false, number = null }) {
  return (
    <article className="catalog-card">
      <Link to={ROUTES.project(project.slug)} className="project-card">
        <div className="project-card__media">
          <Picture
            src={project.coverImage.url}
            alt=""
            width="1600"
            height="1200"
            sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
          {number !== null && <span className="project-card__number">{String(number).padStart(2, '0')}</span>}
          {number !== null && <span className="project-card__open" aria-hidden="true"><ArrowIcon /></span>}
        </div>
        <div className="project-card__body">
          <div className="project-card__meta t-label">
            {project.category && <span>{labelFor(PROJECT_CATEGORIES, project.category)}</span>}
            {project.city && <span>{project.city.split(',')[0]}</span>}
          </div>
          <h3 className="project-card__title">{project.title}</h3>
          <span className="project-card__link">View project <ArrowIcon /></span>
        </div>
      </Link>
    </article>
  );
}
