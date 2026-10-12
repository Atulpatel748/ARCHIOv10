import CtaBand from '../components/common/CtaBand.jsx';
import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import {
  ABOUT, PHILOSOPHY, TEAM, VISION_MISSION, WHY_CHOOSE_US,
} from '../constants/content.js';
import { ROUTES } from '../constants/routes.js';
import { SITE } from '../constants/site.js';
import Picture from '../components/common/Picture.jsx';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';

export default function AboutPage() {
  const teamReveal = useRevealOnScroll();
  const visionReveal = useRevealOnScroll();
  const whyReveal = useRevealOnScroll();
  const philosophyReveal = useRevealOnScroll();
  return (
    <>
      <Seo
        title="About"
        description="Archió is an interior design consultancy in Dubai, focused on creating spaces that work functionally, aesthetically and commercially. A unit of Beracah Trading."
        path={ROUTES.about}
      />
      <div className="screen">
      <PageHead title="About" display />
      <section className="container section--tight" aria-labelledby="about-title">
        <div className="intro">
          <h2 id="about-title" className="statement">{ABOUT.lead}</h2>
          <div className="prose stack">
            {ABOUT.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>
      </div>

      <section ref={teamReveal} className="screen screen--center container section section--ruled reveal-section" aria-labelledby="team-title">
        <h2 id="team-title" className="t-h2 section__head">Our team</h2>
        <ul className="team-grid">
          {TEAM.map((person) => (
            <li key={person.name} className="team-card">
              <Picture
                className="team-card__photo"
                src={person.image}
                alt={`Portrait of ${person.name}`}
                width="480"
                height="480"
                loading="lazy"
              />
              <h3>{person.name}</h3>
              <p className="t-muted">{person.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section ref={visionReveal} className="screen screen--center container section section--ruled reveal-section" aria-label="Vision and mission">
        <div className="pair">
          {VISION_MISSION.map((block) => (
            <div key={block.title} className="stack">
              <h2 className="t-h2">{block.title}</h2>
              <div className="prose stack">
                {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={whyReveal} className="screen screen--center container section section--ruled reveal-section" aria-labelledby="why-title">
        <div className="split">
          <div className="stack">
            <h2 id="why-title" className="t-h2">Why choose us</h2>
            <p className="t-lead">{WHY_CHOOSE_US.lead}</p>
          </div>
          <ol className="toc">
            {WHY_CHOOSE_US.points.map((point, index) => (
              <li key={point} className="toc-row">
                <span className="toc-row__num">{String(index + 1).padStart(2, '0')}</span>
                <p>{point}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section ref={philosophyReveal} className="screen screen--center container section section--ruled reveal-section" aria-labelledby="philosophy-title">
        <div className="split">
          <h2 id="philosophy-title" className="t-h2">Our philosophy</h2>
          <div className="stack">
            <p className="statement">{PHILOSOPHY.lead}</p>
            <div className="prose stack">
              {PHILOSOPHY.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
