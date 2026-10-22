import { renderToString } from 'react-dom/server';
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router';
import { routes } from './routes/index.jsx';

// Renders the home page to HTML at build time (see the archio-prerender plugin in vite.config.js), so its first paint
// already shows the hero instead of waiting for the script. The browser then renders the app afresh over it
// (createRoot, not hydration), so this markup only has to look the same, not match React's tree node for node.
// `hydrate={false}`: no inline data script, which the site's CSP (script-src 'self') would block anyway.
export async function renderHome() {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request('http://localhost/'));
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToString(<StaticRouterProvider router={router} context={context} hydrate={false} />);
}
