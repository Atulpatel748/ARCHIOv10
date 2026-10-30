import type { Metadata } from 'next';
import { pageOpenGraph } from '@/lib/pageMeta';
import ContactForm from '@/components/ContactForm';
import Split from '@/components/Split';
import { site } from '@/content/site';
import styles from './contact.module.scss';

const title = 'Contact';
const description = 'Start a conversation with Archió about a residential, commercial, mixed-use or landscape project in Dubai. WhatsApp, phone, email or enquiry form.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/contact' },
  openGraph: pageOpenGraph(title, description),
};

export default function ContactPage() {
  return (
    <>
      <section className={`section ${styles.talk}`}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.info}>
            <Split as="h1" className={styles.title} text="Start a conversation" />
            <p className={styles.invite} data-reveal>Tell us about the space and what it needs to do. We will reply to arrange a first conversation.</p>
            <dl className={styles.details} data-reveal>
              <div><dt>WhatsApp or call</dt><dd><a href={site.whatsappHref}>{site.phone}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
              <div><dt>Instagram</dt><dd><a href={site.instagramHref}>{site.instagram}</a></dd></div>
            </dl>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
