import { Link } from 'react-router';
import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import { ROUTES } from '../constants/routes.js';
import EmailLink from '../components/common/EmailLink.jsx';
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
                <EmailLink className="link" />.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">What we collect</h2>
              <p>
                When you send an inquiry, we collect your name and email address; optional phone number and city; and
                the project type, property type, approximate area, budget range, preferred timeline, and message you submit.
                Please do not include sensitive information, identity documents, payment-card details, or information about
                other people in the message.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">Why we collect it</h2>
              <p>
                We use this information to respond to your request, assess whether the studio may be able to help, and
                discuss a potential scope of work. We do not sell inquiry information or use it for advertising purposes.
                The form asks you to confirm that you have read this notice and agree to be contacted about the request.
                It also links to our{' '}
                <Link className="link" to={ROUTES.terms}>Terms of service</Link>.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">Cookies</h2>
              <p>
                The site code does not intentionally use analytics or advertising cookies. It uses session storage in your
                current browser tab for scroll restoration, the opening loading screen, and a guard against repeated reloads
                after a deployment. This browser storage is not a cookie and ordinarily clears when the tab session ends.
                The contact form sends the information you submit to Web3Forms for delivery to the studio. For more detail,
                see our <Link className="link" to={ROUTES.cookies}>Cookie policy</Link>. Cookie and storage behavior must
                be rechecked after deployment and whenever integrations change.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">How long we keep it</h2>
              <p>
                Inquiries are delivered to the studio by email; this website does not have an inquiry database or an
                automated deletion job. The studio should retain messages only as long as needed to respond, manage a
                potential or existing business relationship, meet applicable legal obligations, and resolve disputes, then
                delete them under its own documented retention process. No fixed deletion period is promised by this site.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">Who processes it</h2>
              <p>
                Vercel hosts this website. When you submit an inquiry, Web3Forms receives the submitted form information
                and processes it to deliver the message to the studio's email inbox; the studio's email provider then handles
                the message. These providers may also process technical information required to operate their services.
                Review each provider's current privacy and data-processing terms before launch. We do not share inquiry
                information with third parties for advertising or analytics.
              </p>
            </section>

            <section className="stack--sm">
              <h2 className="t-h3">Your rights</h2>
              <p>
                You can ask to see, correct, or delete your personal data at any time by writing to{' '}
                <EmailLink className="link" />.
              </p>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
