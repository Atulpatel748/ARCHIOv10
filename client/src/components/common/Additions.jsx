import { PROCESS, PROJECT_BRIEF_SAMPLE, SAMPLE_CONTENT, SERVICES, TESTIMONIAL } from '../../constants/content.js';
import { PROJECTS } from '../../services/projects.js';

const SampleTag = () => (SAMPLE_CONTENT ? <span className="sample-tag">Sample text</span> : null);
const pad = (n) => String(n).padStart(2, '0');

export function StudioFacts() {
  return (
    <section className="container studio-facts" aria-label="Studio facts">
      <div><b>{pad(PROJECTS.length)}</b><span>Featured projects</span></div>
      <div><b>{pad(SERVICES.items.length)}</b><span>Consultancy services, start to finish</span></div>
      <div><b>Dubai</b><span>UAE · A unit of Beracah Trading</span></div>
    </section>
  );
}

export function Testimonial() {
  return (
    <section className="container testimonial" aria-label="Client testimonial">
      <div><SampleTag /><p className="t-label">What clients say</p></div>
      <figure>
        <blockquote>&ldquo;{TESTIMONIAL.quote}&rdquo;</blockquote>
        <figcaption>{TESTIMONIAL.author} · {TESTIMONIAL.project}</figcaption>
      </figure>
    </section>
  );
}

export function ProcessStrip() {
  return (
    <section className="container process" aria-labelledby="process-title">
      <div className="process__head">
        <div><p className="t-label">How it works</p><h2 id="process-title">From first call to final detail</h2></div>
        <SampleTag />
      </div>
      <ol className="process__steps">
        {PROCESS.map((step, index) => (
          <li key={step.title}>
            <span className="process__num">{pad(index + 1)}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <span className="process__gives">You receive: {step.gives}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ProjectBrief() {
  return (
    <section className="container project-brief" aria-label="Project brief and materials">
      <div><SampleTag /><h3>The brief</h3><p>{PROJECT_BRIEF_SAMPLE.brief}</p></div>
      <div>
        <h3>Materials</h3>
        <ul>{PROJECT_BRIEF_SAMPLE.materials.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div><h3>Floor plan</h3><div className="project-brief__plan">Floor plan image goes here</div></div>
    </section>
  );
}
