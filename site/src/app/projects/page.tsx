import type { Metadata } from 'next';
import WorkPage from '@/components/work/WorkPage';
import { projects } from '@/content/projects';

const title = 'Projects';
const description = 'Residential, commercial and landscape design projects by Archió in Dubai Marina, JLT and Arabian Ranches 2.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/projects' },
  // A page's openGraph replaces the root one whole, so the site-wide fields are repeated here.
  openGraph: { type: 'website', siteName: 'Archió Interior Design Studio', locale: 'en_AE', images: ['/images/projects/dubai-marina-residence/main-bedroom.webp'], title, description },
};

export default function ProjectsPage() {
  return <WorkPage projects={projects} />;
}
