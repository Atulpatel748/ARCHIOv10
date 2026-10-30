import type { Metadata } from 'next';
import WorkPage from '@/components/work/WorkPage';
import { projects } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Residential, commercial and landscape design concepts by Archió for Dubai Marina, JLT and Arabian Ranches 2, shown as design visualisations.',
  alternates: { canonical: '/projects' },
};

export default function ProjectsPage() {
  return <WorkPage projects={projects} />;
}
