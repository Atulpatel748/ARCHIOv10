import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import ProjectsList from '@/components/ProjectsList';
import { projects } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Residential, commercial and landscape design projects by Archió in Dubai Marina, JLT and Arabian Ranches 2, shown as design visualisations.',
  alternates: { canonical: '/projects' },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        label="Projects"
        title="Spaces designed"
        accent="across Dubai."
        intro="Residential, commercial and landscape design across Dubai. Every project is shown as a design visualisation."
        image={{ src: '/images/projects/arabian-ranches-garden/pergola-kitchen-dusk.png', alt: 'Pergola with an outdoor kitchen beside a pool at dusk, design visualisation' }}
      />
      <section className="section container">
        <ProjectsList projects={projects} />
      </section>
    </>
  );
}
