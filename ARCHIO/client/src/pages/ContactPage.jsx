import InquiryForm from '../components/forms/InquiryForm.jsx';
import PageHead from '../components/common/PageHead.jsx';
import Seo from '../components/common/Seo.jsx';
import { CALL_TO_ACTION } from '../constants/content.js';
import { ROUTES } from '../constants/routes.js';
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
                <p className="t-lead">{CALL_TO_ACTION.text}</p>
                <dl className="detail-list">
                  <dt>Email</dt>
                  <dd><a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a></dd>
                  <dt>Phone</dt>
                  <dd><a className="link" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a></dd>
                  <dt>{instagram.label}</dt>
                  <dd><a className="link" href={instagram.href} rel="noopener noreferrer">{instagram.handle}</a></dd>
                  <dt>Studio</dt>
                  <dd>Dubai. {SITE.parent}.</dd>
                </dl>
                <p className="t-muted">Three short steps. The more you tell us, the more useful our first reply will be.</p>
              </div>
            </div>
            <div className="form-panel">
              <InquiryForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
