import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/content/site';
import styles from './privacy.module.scss';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description: 'How Archió handles personal information submitted through its website and enquiry form.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <section className={`section container ${styles.page}`}>
      <p className={`label label--rule ${styles.eyebrow}`}>Website information</p>
      <h1 className="display">Privacy notice</h1>
      <p className={styles.updated}>Last updated: 27 October 2026</p>
      <p className={styles.intro}>This notice explains how Archió Interior Design Studio (“Archió”, “we” or “us”) handles information you submit through this website.</p>

      <div className={styles.body}>
        <section>
          <h2>Who we are</h2>
          <p>Archió Interior Design Studio operates as a unit of Beracah Trading. For questions about this notice or your information, contact <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
        </section>
        <section>
          <h2>Information we collect</h2>
          <p>When you submit an enquiry, we may receive your name, email address or phone number, project type, optional location and message. Basic technical information may also be processed by the hosting platform for security, troubleshooting and abuse prevention.</p>
          <p>Please do not send sensitive personal information through the enquiry form.</p>
        </section>
        <section>
          <h2>How we use it</h2>
          <p>We use enquiry information to respond to your request, understand the project you describe, arrange a follow-up conversation and protect the website from abusive submissions.</p>
        </section>
        <section>
          <h2>Service providers and email delivery</h2>
          <p>When the enquiry email service is enabled, form submissions are sent through Resend to the business inbox configured for this website. The website is also hosted by a deployment provider chosen by the operator. Those providers may process information to deliver, secure and maintain their services; please consult their current privacy terms for details.</p>
        </section>
        <section>
          <h2>Retention and security</h2>
          <p>Enquiry information is intended to be kept only for as long as needed to respond and manage the potential business relationship, unless a longer period is required by law or legitimate record-keeping needs. Reasonable technical and organisational safeguards should be used to protect information. No website or electronic transmission can be guaranteed completely secure.</p>
        </section>
        <section>
          <h2>Your choices and requests</h2>
          <p>Subject to applicable law, you may contact us to ask about your personal information or request that inaccurate information be corrected, that information be deleted where appropriate, or that certain processing stop or be restricted. We may need to verify your identity and may retain records where lawfully required.</p>
        </section>
        <section>
          <h2>Cookies and analytics</h2>
          <p>The current source code does not intentionally install third-party advertising or analytics trackers. The hosting platform and essential website functionality may still use technical logs or similar mechanisms. This section should be updated if analytics, advertising, embedded third-party media or other tracking tools are added.</p>
        </section>
        <section>
          <h2>Changes</h2>
          <p>We may update this notice when the website or our practices change.</p>
        </section>
      </div>
      <p className={styles.back}><Link href="/contact">Return to contact</Link></p>
    </section>
  );
}
