import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import PageHero from '@/components/PageHero';
import { contactCopy, site } from '@/content/site';
import styles from './contact.module.scss';
import Roll from '@/components/Roll';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Start a conversation with Archió about a residential, commercial, mixed-use or landscape project in Dubai. WhatsApp, phone, email or enquiry form.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title="Tell us about the"
        accent="space."
        intro={contactCopy.body}
        image={{ src: '/images/projects/arabian-ranches-garden/entrance-night.png', alt: 'Villa entrance garden lit at night' }}
      >
        <a href={site.whatsappHref} className="btn btn--light"><Roll>Message us on WhatsApp</Roll></a>
      </PageHero>
      <section className={`section container ${styles.grid}`}>
        <div className={styles.info}>
          <p className="label" data-reveal>Or reach us directly</p>
          <dl className={styles.details} data-reveal>
            <div><dt>WhatsApp</dt><dd><a href={site.whatsappHref}>{site.phone}</a></dd></div>
            <div><dt>Phone</dt><dd><a href={site.phoneHref}>{site.phone}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
            <div><dt>Instagram</dt><dd><a href={site.instagramHref}>{site.instagram}</a></dd></div>
            <div><dt>Studio</dt><dd>{site.city}</dd></div>
          </dl>
        </div>
        <div className={styles.formWrap}>
          <h2 className="h3">Send an enquiry</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
