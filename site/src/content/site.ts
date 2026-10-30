// Business information and copy. Everything here comes from the client's company profile and brand kit
// unless marked "CLIENT TO REVIEW" (wording we drafted where the profile had none).

// The public origin feeds canonical URLs, the sitemap, robots and social metadata, so it is checked at build time. On a Vercel
// production deploy it must be set to the real HTTPS domain; a local production build (npm run build) may fall back to localhost.
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const live = process.env.VERCEL_ENV === 'production';
if (live && !configuredSiteUrl) throw new Error('NEXT_PUBLIC_SITE_URL must be set to the public HTTPS website URL for production deploys.');
const siteUrl = new URL(configuredSiteUrl || 'http://localhost:3000');
if (live && siteUrl.protocol !== 'https:') throw new Error('NEXT_PUBLIC_SITE_URL must use HTTPS in production.');
if (siteUrl.pathname !== '/' || siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) {
  throw new Error('NEXT_PUBLIC_SITE_URL must be an origin URL without a path, credentials, query string or fragment.');
}

export const site = {
  name: 'Archió',
  legalName: 'Archió Interior Design Studio',
  parentLine: 'a unit of Beracah Trading',
  footerLine: 'An interior design consultancy in Dubai, for residential, commercial and landscape spaces.',
  url: siteUrl.origin, // CLIENT TO CONFIRM: production domain
  phone: '+971 55 654 1410',
  phoneHref: 'tel:+971556541410',
  whatsappHref: 'https://wa.me/971556541410',
  email: 'info@beracahlogistics.com', // CLIENT TO CONFIRM: a dedicated Archió address
  instagram: '@archio_designstudio',
  instagramHref: 'https://www.instagram.com/archio_designstudio/',
};

export const nav = [
  { href: '/projects', label: 'Projects' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const about = {
  lead: 'An interior design consultancy focused on creating spaces that work functionally, aesthetically, and commercially.',
  body: [
    'Not driven by trends or superficial styling. We work closely with clients to understand how a space needs to perform, then design solutions that align with real-life use, business goals, and long-term value.',
    'Our team brings a strong foundation in luxury residential and high-end commercial design, with a track record of delivering spaces that balance refined aesthetics with real-world function.',
    "We apply that same rigour to Dubai's market across residential, commercial, and mixed-use environments, prioritising clarity, practicality, and thoughtful design decisions over unnecessary complexity.",
  ],
};

export const approach = {
  title: "We don't just design spaces. We guide decisions.",
  body: "Every project begins with a clear understanding of the client's needs, constraints, and expectations. From there, we translate ideas into structured design strategies balancing creativity with feasibility.",
  points: [
    'Clear direction, from concept through to execution',
    'Efficient use of budget and resources',
    'Practical solutions tailored to real-world use',
    'Consistent communication throughout the project',
  ],
};

// "How it goes" steps: wording paraphrased from the profile's Approach and Why Choose Us pages. CLIENT TO REVIEW.
export const processSteps = [
  { title: 'The first conversation', text: "Every project begins with a clear understanding of your needs, constraints and expectations." },
  { title: 'A structured strategy', text: 'Ideas become a structured design strategy, balancing creativity with feasibility.' },
  { title: 'Decisions, guided', text: "Layout, materials and budget, decided with advice that's unbiased and consultancy-driven." },
  { title: 'Through to execution', text: 'Clear direction from concept through to execution, with consistent communication throughout.' },
];

export const servicesIntro = 'We focus primarily on consultancy-based interior design, offering expertise at every stage of a project.';

// Service names are from the profile; the one-line descriptions are CLIENT TO REVIEW.
export const services = [
  { title: 'Interior Design Consultation', text: 'A focused first stage to understand your space, how it needs to perform, your budget and your goals, and to set a clear direction before decisions are made.' },
  { title: 'Concept Development', text: 'A design concept that brings layout, mood, materials and lighting together into one clear direction for the space.' },
  { title: 'Space Planning', text: 'Layouts that organise how a space is used and moved through, so every area works for daily life or for business.' },
  { title: 'Material & Finish Selection', text: 'Guidance on materials, finishes and fixtures, chosen for how they look, how they wear and what they cost.' },
  { title: 'Design Review & Advisory', text: 'An unbiased review of existing plans or designs, with practical advice on what to keep and what to change.' },
  { title: 'Project Coordination Support', text: 'Support in keeping the design intent clear as the project moves from drawings to site, with consistent communication throughout.' },
];

// Services grouped by stage (proposed grouping, owner to confirm), each with a render.
export const serviceStages = [
  { name: 'Define', items: [services[0], services[2]], image: '/images/projects/dubai-marina-residence/study-wall.webp', alt: 'Study wall with timber joinery and lit shelving' },
  { name: 'Design', items: [services[1], services[3]], image: '/images/projects/dubai-marina-residence/media-wall-marble.webp', alt: 'Media wall in book-matched marble framed by timber panelling' },
  { name: 'Support', items: [services[4], services[5]], image: '/images/projects/jlt-office/boardroom-screen.webp', alt: 'Boardroom facing a media wall with timber joinery' },
];

// Residential, commercial and landscape copy adapted from the profile's project pages; mixed-use is CLIENT TO REVIEW.
export const sectors = [
  { title: 'Residential', text: 'Interiors where architecture, material and light come together, from feature walls and joinery to lighting and finishing details, shaped around how our clients actually live.', image: '/images/projects/dubai-marina-residence/main-bedroom.webp' },
  { title: 'Commercial', text: 'Spaces that make the right first impression, from reception areas and lounges to full offices, considered to reflect the brand and support how people work and meet.', image: '/images/projects/jlt-office/managers-office.webp' },
  { title: 'Mixed-use', text: 'Environments that combine living, working and hospitality, planned so that each part works on its own and together.', image: '/images/projects/dubai-marina-residence/dining-room.webp' },
  { title: 'Landscape', text: 'Outdoor spaces where architecture and nature meet, from softscape and hardscape to pools, irrigation and lighting, shaped around the lifestyle of the home.', image: '/images/projects/arabian-ranches-garden/pool-courtyard.webp' },
];

export const vision = 'To create purposeful spaces that balance design integrity with everyday usability, where form always serves function, not the other way around. We move beyond surface-level styling toward environments that genuinely improve how people live, work, and do business.';
export const mission = 'To deliver design solutions rooted in clarity and practicality, guiding clients with honest, expert advice they can rely on. We aim to simplify the design process through structured consultancy, creating spaces that remain relevant well beyond short-term trends.';

export const whyUs = {
  title: 'We measure success in outcomes, not optics.',
  points: [
    'Function carries equal weight to aesthetics, never an afterthought',
    "Advice that's unbiased and consultancy-driven, not sales-driven",
    'Solutions shaped by real constraints, not idealised scenarios',
    'Clarity in communication, from first brief to final handover',
    'Involvement where it matters, not where it adds noise',
  ],
};

export const philosophy = {
  quote: 'Good design is not about making something look expensive.',
  body: "It's about making it work efficiently, intuitively, and consistently. We believe the best spaces are the ones that feel effortless to use, even if they require careful thinking to create.",
};

export const team = [
  { name: 'Pooja Vijayakumar', role: 'Co-Founder, Design', image: '/images/team/pooja-vijayakumar.webp' },
  { name: 'S. Harshitha', role: 'Co-Founder, Strategy & Growth', image: '/images/team/s-harshitha.webp' },
];

