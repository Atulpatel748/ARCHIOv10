import { createBrowserRouter } from 'react-router';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import RouteError from './RouteError.jsx';

// The home page is the entry for most visits, so it ships in the main bundle instead of a separate chunk
// that would only start downloading after the main script has run. Every other page stays lazy.
const page = (load) => ({ lazy: async () => ({ Component: (await load()).default }) });

export const routes = [
  {
    path: '/',
    Component: MainLayout,
    // While a lazy page loads on the first visit, the static #app-preloader in index.html covers the screen,
    // so the router itself renders nothing (declaring it also silences React Router's missing-fallback warning).
    HydrateFallback: () => null,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, Component: HomePage },
          { path: 'projects', ...page(() => import('../pages/ProjectsPage.jsx')) },
          { path: 'projects/:slug', ...page(() => import('../pages/ProjectDetailPage.jsx')) },
          { path: 'services', ...page(() => import('../pages/ServicesPage.jsx')) },
          { path: 'about', ...page(() => import('../pages/AboutPage.jsx')) },
          { path: 'contact', ...page(() => import('../pages/ContactPage.jsx')) },
          { path: 'privacy', ...page(() => import('../pages/PrivacyPage.jsx')) },
          { path: 'terms', ...page(() => import('../pages/TermsPage.jsx')) },
          { path: 'cookies', ...page(() => import('../pages/CookiePage.jsx')) },
          { path: '*', ...page(() => import('../pages/NotFoundPage.jsx')) },
        ],
      },
    ],
  },
];

export const createAppRouter = () => createBrowserRouter(routes);
