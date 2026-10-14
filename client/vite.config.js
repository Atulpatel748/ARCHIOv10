import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { fillHeroPhoto } from './hero-photo.js';
import { sitemapXml } from './sitemap.js';

const envDir = fileURLToPath(new URL('..', import.meta.url));

const replaceSiteUrl = (value, siteUrl) => value.replaceAll('__SITE_URL__', siteUrl);

// The security headers live in vercel.json, which is what production runs; the preview server sends the same ones.
function securityHeaders() {
  const { headers } = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'));
  const rule = headers.find(({ source }) => source === '/(.*)');
  if (!rule) throw new Error('vercel.json has no "/(.*)" header rule, which the preview server takes its security headers from.');
  return Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
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
