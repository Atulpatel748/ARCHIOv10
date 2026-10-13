import { Link } from 'react-router';
import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import { ROUTES } from '../constants/routes.js';
import EmailLink from '../components/common/EmailLink.jsx';
import { SITE } from '../constants/site.js';

export default function CookiePage() {
  return (
    <>
      <Seo
        title="Cookie policy"
        description={`How ${SITE.name} uses cookies on this website.`}
        path={ROUTES.cookies}
      />
      <div className="screen">
        <PageHead title="Cookie policy" size="md" />
        <div className="container section--tight">
          <div className="prose stack--lg">
            <section className="stack--sm">
              <h2 className="t-h3">What cookies we use</h2>
              <p>
                None. This website does not set cookies. It does use two temporary notes in your browser tab only: the last
                scroll position on pages you visited, so the Back button returns you to the same place, and a note that the
                opening loading screen has already been shown, so it does not replay on refresh. These notes are not
                cookies, they are stored only in the current tab, and they are erased when the tab is closed. We do not use
                analytics, advertising, or tracking technologies, and we do not share data about your visit with third
                parties.
              </p>
            </section>
            <section className="stack--sm">
              <h2 className="t-h3">Do we need your consent?</h2>
              <p>
                Because we do not use cookies, we do not show a cookie consent banner. If we ever add analytics,
                advertising, or any other tracking technology, we will update this policy and ask for your consent first.
              </p>
            </section>
            <section className="stack--sm">
              <h2 className="t-h3">Contact</h2>
              <p>
                Questions about this cookie policy can be sent to{' '}
                <EmailLink className="link" />.
                For how we handle your personal data more broadly, see our{' '}
                <Link className="link" to={ROUTES.privacy}>Privacy notice</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
