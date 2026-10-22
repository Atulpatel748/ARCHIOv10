import InquiryForm from '../components/forms/InquiryForm.jsx';
import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import CtaCopy from '../components/common/CtaCopy.jsx';
import { ROUTES } from '../constants/routes.js';
import EmailLink from '../components/common/EmailLink.jsx';
import { SITE } from '../constants/site.js';

export default function ContactPage() {
  const instagram = SITE.social[0];
  return (
    <>
      <Seo
        title="Contact"
        description="Planning a residential, commercial or mixed-use project in Dubai? Tell Archió about your vision and your space."
        path={ROUTES.contact}
      />
      <div className="screen">
        <PageHead title="Let&rsquo;s talk" display />
        <div className="container section--tight">
          <div className="contact-layout">
            <div className="stack--lg">
              <div className="stack">
                <p className="t-lead"><CtaCopy /></p>
                <dl className="detail-list">
                  <dt>Email</dt>
                  <dd><EmailLink className="link" /></dd>
                  <dt>Phone</dt>
                  <dd><a className="link" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a></dd>
                  <dt>{instagram.label}</dt>
                  <dd><a className="link" href={instagram.href} rel="noopener noreferrer">{instagram.handle}</a></dd>
                </dl>
              </div>
            </div>
            {/* The note introduces the form, so it sits on it; on phones that also brings the form up the first screen. */}
            <div className="form-panel">
              <p className="t-muted form-panel__note">Three short steps. The more you tell us, the more useful our first reply will be.</p>
              <InquiryForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
