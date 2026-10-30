import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/pageMeta';
import WorkPage from '@/components/work/WorkPage';
import { projects } from '@/content/projects';

const title = 'Projects';
const description = 'Design visualisations of residential, commercial and landscape spaces by Archió, set in Dubai Marina, JLT and Arabian Ranches 2.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/projects' },
  openGraph: pageOpenGraph(title, description),
};

export default function ProjectsPage() {
  return <WorkPage projects={projects} />;
}
