import { Link } from 'react-router';
import { PROJECT_CATEGORIES, labelFor } from '@archio/shared/constants';
import { ROUTES } from '../../constants/routes.js';
import { formatProjectLocation } from '../../utils/format.js';
import Picture from './Picture.jsx';

export default function ProjectCard({ project, priority = false }) {
  return (
    <article>
      <Link to={ROUTES.project(project.slug)} className="project-card">
        <div className="project-card__media">
          <Picture
            src={project.coverImage.url}
            alt=""
            width="1600"
            height="1200"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
        <div className="project-card__body">
          {project.category && (
            <p className="eyebrow t-label project-card__category">{labelFor(PROJECT_CATEGORIES, project.category)}</p>
          )}
          <h3 className="project-card__title">{project.title}</h3>
          <p className="t-small t-muted">{formatProjectLocation(project)}</p>
        </div>
      </Link>
    </article>
  );
}
