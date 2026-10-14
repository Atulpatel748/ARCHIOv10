import { PROJECTS, featuredProjects } from './src/services/projects.js';
import { modernImageUrl } from './src/utils/images.js';

// The home page opens on the first featured project's cover. public/preloader-gate.js preloads it so the download starts
// alongside the script; it names the photo with the __HERO_PHOTO__ placeholder, filled at build time (see vite.config.js)
// from the same portfolio the page shows, so the two cannot disagree.
// The preload is the AVIF twin, which is what the hero asks for. A cover with no twin (an https:// address) is not
// preloaded, and neither is anything when no project is featured: the placeholder becomes an empty string.
export function heroPhotoUrl(projects = PROJECTS) {
  const first = featuredProjects(projects)[0];
  return first ? (modernImageUrl(first.coverImage.url) ?? '') : '';
}

export const fillHeroPhoto = (source, projects) => source.replaceAll('__HERO_PHOTO__', heroPhotoUrl(projects));
