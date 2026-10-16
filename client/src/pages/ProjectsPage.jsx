import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LIMITS, PROJECT_CATEGORIES, PROJECT_CATEGORY_VALUES } from '@archio/shared/constants';
import PageHead from '../components/common/PageHead.jsx';
import ProjectCard from '../components/common/ProjectCard.jsx';
import Seo from '../components/common/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Input from '../components/ui/Input.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { ROUTES } from '../constants/routes.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useRevealItems } from '../hooks/useRevealItems.js';
import { PROJECTS, listProjects } from '../services/projects.js';

const PAGE_SIZE = 12;

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const gridItems = useRevealItems();
  const rawCategory = params.get('category');
  const category = PROJECT_CATEGORY_VALUES.includes(rawCategory) ? rawCategory : '';
  const page = Math.min(Math.max(Number.parseInt(params.get('page') ?? '1', 10) || 1, 1), LIMITS.PAGE_MAX);
  const urlSearch = (params.get('q') ?? '').slice(0, LIMITS.SEARCH_MAX);

  const [search, setSearch] = useState(urlSearch);
  // The URL can change without this page remounting (the header's Projects link drops ?q), so follow it.
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    if (urlSearch !== search.trim()) setSearch(urlSearch);
  }
  const debouncedSearch = useDebouncedValue(search.trim().slice(0, LIMITS.SEARCH_MAX));

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (debouncedSearch !== urlSearch) update({ q: debouncedSearch, page: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const data = useMemo(() => listProjects(PROJECTS, { category, q: urlSearch, page, limit: PAGE_SIZE }), [category, urlSearch, page]);

  const clearFilters = () => {
    setSearch('');
    setParams({}, { replace: true });
  };

  return (
    <>
      <Seo
        title="Projects"
        description="Browse Archió's residential, commercial and landscape projects in Dubai."
        path={ROUTES.projects}
      />
      <div className="screen">
        <PageHead title="Projects" display />
        <section className="container section--tight" aria-labelledby="project-list-title">
          <h2 id="project-list-title" className="visually-hidden">Project list</h2>
          <div className="filters">
            <div className="chips" role="group" aria-label="Filter by category">
              <button type="button" className="chip" aria-pressed={category === ''} onClick={() => update({ category: '', page: '' })}>All</button>
              {PROJECT_CATEGORIES.map((item) => (
                <button key={item.value} type="button" className="chip" aria-pressed={category === item.value} onClick={() => update({ category: item.value, page: '' })}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="filters__search">
              <Input
                label="Search projects"
                type="search"
                value={search}
                maxLength={LIMITS.SEARCH_MAX}
                placeholder="Try “Marina”…"
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {data.items.length === 0 ? (
            <EmptyState
              title="No projects match"
              action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
            >
              Try a different category or search term.
            </EmptyState>
          ) : (
            <div>
              <p className="t-small t-muted project-grid-count" role="status">{data.meta.total} {data.meta.total === 1 ? 'project' : 'projects'}</p>
              {/* An editorial spread on wide screens: a large photo, a smaller one beside it, then a large one shifted right. */}
              <div ref={gridItems} className="project-grid project-grid--editorial">
                {data.items.map((project, index) => (
                  <ProjectCard key={project.slug} project={project} priority={index < 4} number={(data.meta.page - 1) * data.meta.limit + index + 1} />
                ))}
              </div>
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={(next) => {
                  update({ page: next > 1 ? String(next) : '' });
                  window.scrollTo({ top: 0 });
                }}
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
