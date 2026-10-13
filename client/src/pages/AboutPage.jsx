import CtaBand from '../components/common/CtaBand.jsx';
import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import {
  ABOUT, APPROACH, PHILOSOPHY, SERVICES, TEAM, VISION_MISSION, WHY_CHOOSE_US,
} from '../constants/content.js';
import { ROUTES } from '../constants/routes.js';
import Picture from '../components/common/Picture.jsx';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';

const SECTION = 'screen screen--center screen--compact container section section--ruled reveal-section';

// One row of the About page: the title on the left, a thin rule, and the text on the right (as in the company profile).
function AboutRow({ id, title, children }) {
  return (
    <div className="about-split">
      <h2 id={id} className="about-split__title">{title}</h2>
      <div className="about-split__body lora">{children}</div>
    </div>
  );
}

const Bullets = ({ items }) => (
  <ul className="about-list">
    {items.map((item) => <li key={item}>{item}</li>)}
  </ul>
);

export default function AboutPage() {
  const teamReveal = useRevealOnScroll();
  const approachReveal = useRevealOnScroll();
  const servicesReveal = useRevealOnScroll();
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
          <AboutRow id="about-title" title="About us">
            <p className="t-lead">{ABOUT.lead}</p>
            {ABOUT.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </AboutRow>
        </section>
      </div>

      <section ref={teamReveal} className={SECTION} aria-labelledby="team-title">
        <h2 id="team-title" className="about-team__title">Our team</h2>
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

      <section ref={approachReveal} className={SECTION} aria-labelledby="approach-title">
        <AboutRow id="approach-title" title="Our approach">
          <p className="eyebrow t-label">{APPROACH.heading}</p>
          <p>{APPROACH.intro}</p>
          <p>{APPROACH.principle}</p>
          <p>{APPROACH.lead}</p>
          <Bullets items={APPROACH.points} />
        </AboutRow>
      </section>

      <section ref={servicesReveal} className={SECTION} aria-labelledby="services-title">
        <AboutRow id="services-title" title="Our services">
          <p>{SERVICES.lead}</p>
          <Bullets items={SERVICES.items.map((item) => item.title)} />
        </AboutRow>
      </section>

      <section ref={visionReveal} className={SECTION} aria-label="Vision and mission">
        <div className="vision-mission">
          {VISION_MISSION.map((block) => (
            <div key={block.title} className="vision-mission__half">
              <h2 className="about-split__title">{block.title}</h2>
              <div className="lora">
                {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section ref={whyReveal} className={SECTION} aria-labelledby="why-title">
        <AboutRow id="why-title" title="Why choose us">
          <p>{WHY_CHOOSE_US.lead}</p>
          <Bullets items={WHY_CHOOSE_US.points} />
        </AboutRow>
      </section>

      <section ref={philosophyReveal} className={SECTION} aria-labelledby="philosophy-title">
        <AboutRow id="philosophy-title" title="Our philosophy">
          <p>{PHILOSOPHY.lead}</p>
          {PHILOSOPHY.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </AboutRow>
      </section>

      <CtaBand />
    </>
  );
}
