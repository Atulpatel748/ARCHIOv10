import { Link } from 'react-router';
import { PROJECT_CATEGORIES, labelFor } from '@archio/shared/constants';
import { ROUTES } from '../../constants/routes.js';
import Picture from './Picture.jsx';

export default function ProjectCard({ project, priority = false, number }) {
  return (
    <article>
      <Link to={ROUTES.project(project.slug)} className="project-card">
        <div className="project-card__media">
          <Picture
            src={project.coverImage.url}
            alt=""
            width="1600"
            height="1200"
            sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
        <div className="project-card__body">
          {project.category && (
            <p className="eyebrow t-label project-card__category">
              {number && <span className="project-card__number">{String(number).padStart(2, '0')} · </span>}
              {labelFor(PROJECT_CATEGORIES, project.category)}
            </p>
          )}
          {/* No location line: every project is in Dubai and its name already says where; the project page has it. */}
          <h3 className="project-card__title">{project.title}</h3>
        </div>
      </Link>
    </article>
  );
}
