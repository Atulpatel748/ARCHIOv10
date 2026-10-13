// ARCHIÓ PORTFOLIO — the projects the website shows. This file is built into the site (and its sitemap), so a change
// here goes live with the next deploy. To add a project:
//   1. Put the photos in client/public/images/projects/<slug>/ as 01.jpg, 02.jpg, ... (plus 01.avif, 02.avif, ... — run
//      `npm run images -w client` to create them). 01 is the cover photo; the rest form the gallery (at most 12 more).
//      Photos hosted elsewhere can be given as https:// addresses instead.
//   2. Copy one of the entries below, give it a new unique `slug` (lowercase letters, numbers and hyphens), and list one
//      description (alt text) per photo, in the same order, under `images`.
//   3. Run `npm test` (it checks every entry and that each photo exists), then redeploy. Deleting an entry takes the
//      project off the site.
//
// The order here is the order on the site, and the first `featured: true` projects (at most 6 are used, 3 or 4
// recommended) appear on the home page.
//
// `category` is residential, commercial or landscape. `style` and `year` are optional; leave them out when unknown.
// Photos live in client/public/images/projects/<slug>/NN.jpg: 01.jpg is the cover, the rest form the gallery.
const IMAGE_DIR = '/images/projects';

// Areas are stored in square metres. The profile gives 2,500 sq ft and 2,000 sq ft for the first two projects.
// `city` holds the location the profile names (district first), shown with the country as "Dubai Marina, Dubai, United Arab Emirates".
const SQFT_TO_SQM = 0.09290304;
const fromSqft = (sqft) => Math.round(sqft * SQFT_TO_SQM * 100) / 100;

const SOURCE = [
  {
    slug: 'dubai-marina-residence', title: 'Dubai Marina Residence', category: 'residential',
    city: 'Dubai Marina, Dubai', country: 'United Arab Emirates', areaSqm: fromSqft(2500), featured: true,
    summary: 'Interiors where architecture, material and light work as one, shaped around how our clients actually live.',
    description: 'We design and build interiors where architecture, material, and light work as one, from feature walls and joinery to lighting and finishing details. Every space is shaped around how our clients actually live, delivered with precision and craftsmanship from concept to completion.\n\nOur aim is simple: interiors our clients love living in, every single day.',
    images: [
      'Double-height living room with marble-clad feature walls and a crystal chandelier',
      'Marble and dark stone feature wall with built-in shelving and a chandelier',
      'Dining room with a long table, light upholstered chairs and a patterned rug',
      'Staircase beside a curved bar counter with stools, under a glass balustrade',
      'White kitchen with warm timber cabinetry and a central island',
      'Open-plan kitchen and dining area in white and warm timber',
      'Bedroom with an arched floral feature wall and a pendant light',
      'Bedroom with a pink upholstered headboard and arched wall detailing',
      'Bedroom dressing area with curved panelling, shelving and spherical pendant lights',
      'Twin bedroom with illuminated arched panels above each bed',
      'Master bedroom with a fluted headboard wall and a sculptural light line',
      'Study area with timber shelving and spherical pendant lights',
      'Living room with a wall-mounted television, built-in shelving and a sculptural light fitting',
    ],
  },
  {
    slug: 'jlt-commercial-interior', title: 'JLT Commercial Interior', category: 'commercial',
    city: 'JLT, Dubai', country: 'United Arab Emirates', areaSqm: fromSqft(2000), featured: true,
    summary: 'Commercial spaces that make the right first impression, from reception areas and lounges to full office fit-outs.',
    description: 'Commercial spaces that make the right first impression, from reception areas and lounges to full office fit-outs. Every detail, from material selection to lighting, is considered to reflect the brand and support how people actually work and meet.\n\nOur aim is simple: commercial spaces our clients are proud to welcome people into, every day.',
    images: [
      'Boardroom with a long white table and cream high-back chairs',
      'Meeting room with a ceiling grid, a wall screen and a long conference table',
      'Meeting room with a wall-mounted screen and a sculptural ceiling light',
      'Executive office with a glass corner, a desk and two round armchairs',
      'Open-plan office with white workstations and linear lighting',
      'Private office with a white desk and visitor chairs',
      'Executive office with a desk and a seating area before a marble wall',
      'Office kitchenette with timber upper cabinets and white base units',
      'Pantry with a built-in coffee station and glazed doors',
      'Reception lounge with a marble wall carrying a placeholder logo, ring light fittings and curved seating',
      'Reception area with a marble feature wall, a placeholder logo and a glazed entrance',
    ],
  },
  {
    slug: 'arabian-ranches-2-landscape', title: 'Arabian Ranches 2', category: 'landscape',
    city: 'Arabian Ranches 2, Dubai', country: 'United Arab Emirates', areaSqm: 6500, featured: true,
    summary: 'Classic Arabian architecture and a relaxed, resort-style way of living outdoors.',
    description: 'This landscape design brings together classic Arabian architecture and a relaxed, resort-style way of living outdoors. Palms and layered greenery line a stone path to the entrance, setting a calm, welcoming tone from the moment you arrive.\n\nWe design and build outdoor spaces where architecture and nature meet, from softscaping and hardscaping to pools, irrigation, and lighting. Every project is shaped around the client\'s lifestyle and the character of the property, delivered with quality craftsmanship from concept to completion.\n\nOur aim is simple: outdoor spaces our clients love living in, season after season.',
    images: [
      'Villa entrance by day with palms, layered planting and a stone path',
      'Villa entrance at dusk with lit palms and planting',
      'Garden passage with stepping stones, lawn and timber screening',
      'Covered outdoor kitchen beneath a timber pergola',
      'Pool terrace with sun loungers beside a villa',
      'Courtyard pool with sculptural loungers and potted plants',
      'Aerial view of a courtyard garden with a stepped stone path at dusk',
    ],
  },
];

// Turns an entry above into the shape the website uses: `images` (one description per photo) becomes the cover image plus gallery.
const build = ({ slug, images, ...rest }) => {
  const [coverImage, ...gallery] = images.map((alt, index) => ({
    url: `${IMAGE_DIR}/${slug}/${String(index + 1).padStart(2, '0')}.jpg`,
    alt,
  }));
  return { ...rest, slug, coverImage, gallery };
};

export const PROJECTS = Object.freeze(SOURCE.map(build));
