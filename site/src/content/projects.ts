// The three projects from the company profile. Image sizes are the extracted placeholders; replace with the original renders.

export type ProjectImage = { src: string; alt: string; width: number; height: number; room?: string };
export type Project = {
  slug: string;
  title: string; // CLIENT TO CONFIRM: working titles; the profile names projects by location only
  category: 'Residential' | 'Commercial' | 'Landscape';
  location: string;
  area: string;
  summary: string;
  description: string[];
  cover: ProjectImage;
  hero: ProjectImage;
  gallery: ProjectImage[];
};

const img = (slug: string, file: string, width: number, height: number, alt: string, room?: string): ProjectImage =>
  ({ src: `/images/projects/${slug}/${file}.webp`, width, height, alt, room });

const dm = 'dubai-marina-residence';
const jlt = 'jlt-office';
const ar = 'arabian-ranches-garden';

export const projects: Project[] = [
  {
    slug: dm,
    title: 'Dubai Marina Residence',
    category: 'Residential',
    location: 'Dubai Marina',
    area: '2,500 sq ft',
    summary: 'A residence where architecture, material and light come together, from feature walls and joinery to lighting and finishing details.',
    description: [
      'We design interiors where architecture, material, and light come together seamlessly, from feature walls and joinery to lighting and finishing details.',
      'Every space is shaped around how our clients actually live, with precision from concept to completion. Our aim is simple: interiors our clients love living in, every single day.',
    ],
    cover: img(dm, 'main-bedroom', 800, 707, 'Bedroom with an upholstered panel wall, a sculpted light line and paired lamps'),
    hero: img(dm, 'living-room', 707, 800, 'Double-height living room with book-matched marble wall panels and a sculptural chandelier'),
    gallery: [
      img(dm, 'living-room', 707, 800, 'Double-height living room with book-matched marble wall panels and a sculptural chandelier', "Living room"),
      img(dm, 'media-wall-marble', 707, 800, 'Media wall in book-matched marble framed by timber panelling', "Living room"),
      img(dm, 'media-room', 626, 800, 'Media room with a light sculpture above timber and marble joinery', "Living room"),
      img(dm, 'bar-under-stair', 666, 800, 'Curved bar beneath a marble staircase with an arched display niche', "Bar and dining"),
      img(dm, 'dining-room', 800, 666, 'Dining room with organic wall mirrors and a cluster pendant', "Bar and dining"),
      img(dm, 'kitchen-island', 800, 666, 'Kitchen with a fluted island, timber upper cabinets and a stone splashback', "Kitchen"),
      img(dm, 'kitchen-dining', 800, 666, 'Kitchen with a round breakfast table beneath paired pendants', "Kitchen"),
      img(dm, 'main-bedroom', 800, 707, 'Bedroom with an upholstered panel wall, a sculpted light line and paired lamps', "Bedrooms"),
      img(dm, 'blush-bedroom', 800, 800, 'Blush bedroom with an arched upholstered headboard', "Bedrooms"),
      img(dm, 'dressing-area', 800, 800, 'Dressing area with a blush upholstered panel and lit shelving', "Bedrooms"),
      img(dm, 'childrens-bedroom', 707, 800, "Children's bedroom with an arched floral mural and globe pendant", "Children's rooms"),
      img(dm, 'twin-bedroom', 800, 707, 'Twin bedroom with arched backlit wall panels', "Children's rooms"),
      img(dm, 'study-wall', 800, 707, 'Study wall with timber joinery, lit shelving and a globe pendant', "Study"),
    ],
  },
  {
    slug: jlt,
    title: 'JLT Office',
    category: 'Commercial',
    location: 'Jumeirah Lake Towers (JLT)',
    area: '2,000 sq ft',
    summary: 'Commercial spaces that make the right first impression, from reception areas and lounges to a full office.',
    description: [
      'Commercial spaces that make the right first impression, from reception areas and lounges to full office fit-outs.',
      'Every detail, from material selection to lighting, is considered to reflect the brand and support how people actually work and meet. Our aim is simple: commercial spaces our clients are proud to welcome people into, every day.',
    ],
    cover: img(jlt, 'managers-office', 800, 626, "Manager's office with a marble feature wall and lit shelving"),
    hero: img(jlt, 'boardroom', 800, 640, 'Boardroom with a white stone table, cream leather chairs and a perforated ceiling'),
    gallery: [
      img(jlt, 'boardroom', 800, 640, 'Boardroom with a white stone table, cream leather chairs and a perforated ceiling', "Boardroom"),
      img(jlt, 'boardroom-screen', 800, 640, 'Boardroom facing a media wall with timber joinery', "Boardroom"),
      img(jlt, 'managers-office', 800, 626, "Manager's office with a marble feature wall and lit shelving", "Offices"),
      img(jlt, 'private-office', 626, 800, 'Private office with a white stone desk, fluted panelling and lit shelving', "Offices"),
      img(jlt, 'glass-office', 800, 640, 'Glass-fronted office with a sculpted desk and soft seating', "Offices"),
      img(jlt, 'office-cover', 652, 800, 'Executive office with a sculptural pendant and a wall-mounted screen', "Offices"),
      img(jlt, 'open-office', 800, 626, 'Open office workstations with timber shelving and linear lighting', "Open office"),
      img(jlt, 'pantry', 626, 800, 'Pantry kitchen with timber upper cabinets', "Pantry"),
      img(jlt, 'coffee-station', 626, 800, 'Coffee station set into lit timber joinery', "Pantry"),
    ],
  },
  {
    slug: ar,
    title: 'Arabian Ranches 2 Garden',
    category: 'Landscape',
    location: 'Arabian Ranches 2',
    area: '6,500 sqm',
    summary: 'A landscape that brings together classic Arabian architecture and a relaxed, resort-style way of living outdoors.',
    description: [
      'This landscape design brings together classic Arabian architecture and a relaxed, resort-style way of living outdoors. Palms and layered greenery line a stone path to the entrance, setting a calm, welcoming tone from the moment you arrive.',
      "We design outdoor spaces where architecture and nature meet, from softscaping and hardscaping to pools, irrigation, and lighting. Every project is shaped around the client's lifestyle and the character of the property. Our aim is simple: outdoor spaces our clients love living in, season after season.",
    ],
    cover: img(ar, 'pergola-kitchen-dusk', 800, 640, 'Pergola with an outdoor kitchen beside the pool at dusk'),
    hero: img(ar, 'entrance-path', 800, 640, 'Villa entrance with a stepping-stone path, palms and layered planting'),
    gallery: [
      img(ar, 'entrance-path', 800, 640, 'Villa entrance with a stepping-stone path, palms and layered planting', "Entrance"),
      img(ar, 'entrance-night', 800, 640, 'The entrance garden lit at night', "Entrance"),
      img(ar, 'pool-terrace', 800, 640, 'Pool terrace with sculpted loungers and potted topiary', "Pool"),
      img(ar, 'pool-courtyard', 800, 640, 'Pool courtyard beneath a pergola with mature trees', "Pool"),
      img(ar, 'pergola-kitchen-dusk', 800, 640, 'Pergola with an outdoor kitchen beside the pool at dusk', "Pergola and kitchen"),
      img(ar, 'side-garden', 800, 640, 'Side garden path between slatted screens and lawn', "Gardens"),
      img(ar, 'garden-night', 800, 640, 'The garden from above at night', "Gardens"),
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
