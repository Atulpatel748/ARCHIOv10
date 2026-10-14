import '@fontsource-variable/public-sans'; // brand kit: website and UI text
import '@fontsource/marcellus'; // display headings (the brand kit's Optima needs a paid web licence and is not used)
import '@fontsource-variable/lora'; // brand kit's third font: project descriptions
import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { preloaderPainted } from './utils/preloader.js';

// React Router remembers scroll positions per history entry, and the first page of every load shares the key "default".
// A fresh load (address bar, bookmark, link from elsewhere) would therefore open wherever the previous page in this tab
// was scrolled to. Forget that one position unless this load is a reload or Back/Forward, where restoring it is right.
if (performance.getEntriesByType?.('navigation')[0]?.type === 'navigate') {
  try {
    const key = 'react-router-scroll-positions';
    const positions = JSON.parse(sessionStorage.getItem(key) ?? 'null');
    if (positions && 'default' in positions) {
      delete positions.default;
      sessionStorage.setItem(key, JSON.stringify(positions));
    }
  } catch {
    // Storage blocked or unreadable: nothing was saved, so there is nothing to forget.
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Lets the static HTML preloader (see index.html) leave once React has taken over the page.
// Done on the next frame so the real content has actually painted, not just mounted. utils/preloader.js
// decides the rest: it leaves now, or when whatever holds it (the hero, waiting for its first photo) is ready, or after a time limit.
requestAnimationFrame(() => {
  requestAnimationFrame(preloaderPainted);
});
