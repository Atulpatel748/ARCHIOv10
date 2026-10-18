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
                The website code does not intentionally set cookies for analytics or advertising. It uses session storage
                in the current browser tab for scroll restoration, the opening loading screen, and a guard against repeated
                reloads after a deployment. Session storage is separate from cookies and ordinarily clears when the tab
                session ends. When you submit the contact form, the information you enter is sent to Web3Forms for delivery
                to the studio; that provider may process technical data needed to operate its service. Recheck browser
                storage and network behavior on the production domain before launch and after integrations change.
              </p>
            </section>
            <section className="stack--sm">
              <h2 className="t-h3">Do we need your consent?</h2>
              <p>
                This site currently does not include analytics or advertising integrations and therefore does not show a cookie banner.
                If analytics, advertising, or other non-essential tracking is added, this policy and any consent controls will
                be reviewed and updated where required.
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
