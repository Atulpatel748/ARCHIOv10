import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { fillHeroPhoto } from './hero-photo.js';
import { sitePaths, sitemapXml } from './sitemap.js';

const envDir = fileURLToPath(new URL('..', import.meta.url));

const replaceSiteUrl = (value, siteUrl) => value.replaceAll('__SITE_URL__', siteUrl);

// The security headers live in vercel.json, which is what production runs; the preview server sends the same ones.
function securityHeaders() {
  const { headers } = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'));
  const rule = headers.find(({ source }) => source === '/(.*)');
  if (!rule) throw new Error('vercel.json has no "/(.*)" header rule, which the preview server takes its security headers from.');
  return Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
}

// The home page is the entry for most visits, and its largest element (the hero wordmark) used to wait for the whole
// script before it could paint. After the client build this renders the home page to HTML (src/prerender.jsx) and puts
// it in index.html, so the first paint already shows it. Every other page gets shell.html, the same file with an empty
// root: vercel.json rewrites known app routes there; the preview server mirrors those routes and returns a 404 for unknown clean paths.
function prerenderHome() {
  let outDir = 'dist';
  const knownPages = new Set(sitePaths().filter((path) => path !== '/'));
  const normalizePath = (path) => path === '/' ? '/' : path.replace(/\/+$/, '');
  const isPage = (path) => knownPages.has(normalizePath(path));
  const isCleanUnknownPath = (path) => path !== '/' && !path.includes('.') && !/^\/(assets|images|brand)\//.test(path) && !isPage(path);
  return {
    name: 'archio-prerender',
    configResolved: (config) => { outDir = join(config.root, config.build.outDir); },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const [path, query] = req.url.split('?');
        if (req.method !== 'GET') return next();
        if (isPage(path)) {
          req.url = `/shell.html${query ? `?${query}` : ''}`;
          return next();
        }
        if (isCleanUnknownPath(path)) {
          try {
            const notFound = await readFile(join(outDir, '404.html'), 'utf8');
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(notFound);
            return;
          } catch (error) {
            return next(error);
          }
        }
        return next();
      });
    },
    async closeBundle() {
      // A separate server build of src/prerender.jsx, imported once and then deleted. (A Vite dev server with
      // ssrLoadModule rendered the same, but never let the build process exit.)
      const root = fileURLToPath(new URL('.', import.meta.url));
      const tmp = join(root, 'node_modules', '.archio-prerender');
      try {
        await build({
          configFile: false,
          root,
          envDir,
          envPrefix: ['VITE_', 'WEB3FORMS_'],
          logLevel: 'error',
          plugins: [react()],
          resolve: { alias: { '@': join(root, 'src') } },
          build: { ssr: 'src/prerender.jsx', outDir: tmp, emptyOutDir: true },
        });
        const { renderHome } = await import(pathToFileURL(join(tmp, 'prerender.js')).href);
        // style="" attributes in static HTML are inline styles, which the CSP (style-src 'self') blocks with a console
        // error each. React sets the same ones through the DOM once it renders, so the static copy goes without them.
        const markup = (await renderHome()).replace(/ style="[^"]*"/g, '');
        const indexFile = join(outDir, 'index.html');
        const shell = await readFile(indexFile, 'utf8');
        if (!shell.includes('<div id="root"></div>')) throw new Error('index.html has no empty <div id="root"></div> to prerender into.');
        await writeFile(join(outDir, 'shell.html'), shell);
        await writeFile(indexFile, shell.replace('<div id="root"></div>', `<div id="root">${markup}</div>`));
      } finally {
        await rm(tmp, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const configuredSiteUrl = loadEnv(mode, envDir, 'VITE_').VITE_SITE_URL;
  // On Vercel a missing VITE_SITE_URL would put localhost into every canonical link, OG tag and the sitemap.
  if (command === 'build' && process.env.VERCEL && !configuredSiteUrl) {
    throw new Error('Set VITE_SITE_URL (the public https:// address of the site) in the Vercel project settings.');
  }
  const siteUrl = (configuredSiteUrl || 'http://localhost:5173').replace(/\/$/, '');
  const env = loadEnv(mode, envDir, ['VITE_', 'WEB3FORMS_']);
  const formKey = env.WEB3FORMS_ACCESS_KEY || env.VITE_WEB3FORMS_ACCESS_KEY || '';
  if (command === 'build' && (!formKey || formKey.startsWith('YOUR_'))) {
    console.warn('\n[archio] No Web3Forms access key is set: the contact form in this build tells visitors to email instead. Set WEB3FORMS_ACCESS_KEY (see .env.example).\n');
  }
  // Vite does not put .env values on process.env for this file, so read the tunnel host explicitly.
  const ngrokHost = loadEnv(mode, envDir, 'NGROK_').NGROK_HOST;
  // Vite also reads NODE_ENV from the shared root .env. "development" there makes `vite build` emit a
  // development React build (larger, StrictMode double effects), so refuse to build rather than ship it.
  if (command === 'build' && process.env.VITE_USER_NODE_ENV === 'development') {
    throw new Error('NODE_ENV=development is set in .env, which would produce a development build of the client. Remove or comment out that line (see .env.example) and rebuild.');
  }
  return {
    envDir,
    // Vite only exposes VITE_* to the browser; the Web3Forms key is sent from the browser too, so it is allowed explicitly.
    envPrefix: ['VITE_', 'WEB3FORMS_'],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    plugins: [
      react(),
      {
        // Enforce asset signatures even when the deployment invokes `vite build` directly instead of `npm run build`.
        name: 'archio-asset-integrity',
        apply: 'build',
        buildStart() {
          execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/check-assets.mjs', import.meta.url))], { stdio: 'inherit' });
        },
      },
      {
        name: 'archio-site-url',
        transformIndexHtml: (html) => replaceSiteUrl(html, siteUrl),
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/sitemap.xml') {
              res.setHeader('Content-Type', 'application/xml; charset=utf-8');
              return res.end(sitemapXml(siteUrl));
            }
            const filename = { '/robots.txt': 'robots.txt', '/llms.txt': 'llms.txt', '/preloader-gate.js': 'preloader-gate.js' }[req.url];
            if (!filename) return next();

            try {
              res.setHeader('Content-Type', filename.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/plain; charset=utf-8');
              const source = await readFile(join(fileURLToPath(new URL('./public', import.meta.url)), filename), 'utf8');
              res.end(fillHeroPhoto(replaceSiteUrl(source, siteUrl)));
            } catch (error) {
              next(error);
            }
          });
        },
        // Public files are copied as-is, so fill their placeholders (site URL, hero photo) after the copy.
        writeBundle: async ({ dir }) => {
          for (const filename of ['robots.txt', 'llms.txt', 'preloader-gate.js']) {
            const file = join(dir, filename);
            await writeFile(file, fillHeroPhoto(replaceSiteUrl(await readFile(file, 'utf8'), siteUrl)));
          }
          await writeFile(join(dir, 'sitemap.xml'), sitemapXml(siteUrl));
        },
      },
      prerenderHome(),
      {
        // Headings are set in Marcellus and everything else in Public Sans. Their files get a new hash on every build, so
        // the preload tags are written from the finished bundle; without them the first paint uses fallback fonts, and
        // the fonts would only start downloading after the CSS.
        name: 'archio-preload-fonts',
        transformIndexHtml: (_html, ctx) =>
          Object.keys(ctx.bundle ?? {})
            .filter((file) => /(marcellus-latin-400-normal|public-sans-latin-wght-normal)-.+\.woff2$/.test(file))
            .map((file) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' }, injectTo: 'head-prepend' })),
      },
    ],
    server: { port: 5173, allowedHosts: ngrokHost ? [ngrokHost] : [] },
    preview: { port: 4173, headers: securityHeaders() },
    build: { target: 'es2022', sourcemap: false },
    test: {
      environment: 'jsdom',
      // One jsdom per worker with a fresh window per test file, instead of a new process and jsdom per file.
      // `vitest doctor` measured this at about 3.4x faster than the default here; `isolate: false` was
      // faster still but fails, because some tests rely on a clean window.
      pool: 'vmThreads',
      setupFiles: ['./src/test/setup.js'],
      css: false,
      restoreMocks: true,
    },
  };
});
