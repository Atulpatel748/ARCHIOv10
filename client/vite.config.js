import react from '@vitejs/plugin-react';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { SECURITY_HEADERS } from './security-headers.js';
import { sitemapXml } from './sitemap.js';

const envDir = fileURLToPath(new URL('..', import.meta.url));

const replaceSiteUrl = (value, siteUrl) => value.replaceAll('__SITE_URL__', siteUrl);

export default defineConfig(({ command, mode }) => {
  const configuredSiteUrl = loadEnv(mode, envDir, 'VITE_').VITE_SITE_URL;
  // On Vercel a missing VITE_SITE_URL would put localhost into every canonical link, OG tag and the sitemap.
  if (command === 'build' && process.env.VERCEL && !configuredSiteUrl) {
    throw new Error('Set VITE_SITE_URL (the public https:// address of the site) in the Vercel project settings.');
  }
  const siteUrl = (configuredSiteUrl || 'http://localhost:5173').replace(/\/$/, '');
  // Vite does not put .env values on process.env for this file, so read the tunnel host explicitly.
  const ngrokHost = loadEnv(mode, envDir, 'NGROK_').NGROK_HOST;
  // Vite also reads NODE_ENV from the shared root .env. "development" there makes `vite build` emit a
  // development React build (larger, StrictMode double effects), so refuse to build rather than ship it.
  if (command === 'build' && process.env.VITE_USER_NODE_ENV === 'development') {
    throw new Error('NODE_ENV=development is set in .env, which would produce a development build of the client. Remove or comment out that line (see .env.example) and rebuild.');
  }
  return {
    envDir,
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
            const filename = { '/robots.txt': 'robots.txt', '/llms.txt': 'llms.txt' }[req.url];
            if (!filename) return next();

            try {
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.end(replaceSiteUrl(await readFile(join(fileURLToPath(new URL('./public', import.meta.url)), filename), 'utf8'), siteUrl));
            } catch (error) {
              next(error);
            }
          });
        },
        // Public crawler files are copied as-is, so fill their site URL placeholders after the copy.
        writeBundle: async ({ dir }) => {
          for (const filename of ['robots.txt', 'llms.txt']) {
            const file = join(dir, filename);
            await writeFile(file, replaceSiteUrl(await readFile(file, 'utf8'), siteUrl));
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
    preview: { port: 4173, headers: SECURITY_HEADERS },
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
