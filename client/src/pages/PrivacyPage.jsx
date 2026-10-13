import { Link } from 'react-router';
import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import { ROUTES } from '../constants/routes.js';
import { SITE } from '../constants/site.js';

export default function PrivacyPage() {
  return (
    <>
      <Seo title="Privacy notice" description="How Archió collects, uses and protects your personal data." path={ROUTES.privacy} />
      <div className="screen">
        <PageHead title="Privacy notice" size="md" />
        <div className="container section--tight">
          <div className="prose stack--lg">

            <section className="stack--sm">
              <h2 className="t-h3">Who we are</h2>
              <p>
                {SITE.name} is an interior design studio and a unit of {SITE.parent}. Questions about this notice can be
                sent to{' '}
                <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">What we collect</h2>
              <p>
                When you send an inquiry, we collect your name, email address, optional phone number and city, and the
                details you provide about your project. We do not collect sensitive personal data such as financial
                details, health information, or government identification numbers.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">Why we collect it</h2>
              <p>
                We use this information to respond to your request, assess your project, and discuss a potential scope of
                work. We do not sell your personal data and we do not use it for advertising or marketing purposes. By
                submitting an inquiry, you confirm that you have read and agreed to our{' '}
                <Link className="link" to={ROUTES.terms}>Terms of service</Link>.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">Cookies</h2>
              <p>
                This website does not set cookies. It does use temporary browser storage in the current tab to remember
                how far you have scrolled on the pages you visited and whether the opening loading screen has already been
                shown. These notes are not cookies, they are stored only in your current browser tab, and they are erased
                when the tab is closed. We do not use analytics, advertising, or tracking technologies. For full details,
                see our <Link className="link" to={ROUTES.cookies}>Cookie policy</Link>.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">How long we keep it</h2>
              <p>
                We keep inquiry emails only for as long as needed to respond to your request and manage our business
                relationship. If an inquiry does not become a project, we delete it after 24 months unless we are legally
                required to retain it.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">Who processes it</h2>
              <p>
                Our hosting and email providers process data on our behalf under their standard data-processing terms. We
                do not share your personal data with any third party for marketing or analytics purposes.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">Your rights</h2>
              <p>
                You can ask to see, correct, or delete your personal data at any time by writing to{' '}
                <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
