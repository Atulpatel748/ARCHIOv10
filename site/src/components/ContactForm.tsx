'use client';

import { useState } from 'react';
import { site } from '@/content/site';
import styles from './ContactForm.module.scss';

type Errors = Partial<Record<'name' | 'contact' | 'type' | 'consent', string>>;
const TYPES = ['Residential', 'Commercial', 'Mixed-use', 'Landscape'];

function validate(data: FormData): Errors {
  const errors: Errors = {};
  const name = String(data.get('name') ?? '').trim();
  const contact = String(data.get('contact') ?? '').trim();
  if (name.length < 2) errors.name = 'Please enter your name.';
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^\+?[\d\s()-]{7,20}$/.test(contact);
  if (!isEmail && !isPhone) errors.contact = 'Please enter a valid email address or phone number.';
  if (!data.get('type')) errors.type = 'Please choose a type of project.';
  if (!data.get('consent')) errors.consent = 'Please confirm so we can reply to you.';
  return errors;
}

export default function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      const field = form.elements.namedItem(firstInvalid);
      ((field instanceof RadioNodeList ? field[0] : field) as HTMLElement | null)?.focus();
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(data)) });
      if (!res.ok) throw new Error(String(res.status));
      setState('sent');
      form.reset();
    } catch {
      setState('failed');
    }
  }

  if (state === 'sent') {
    return (
      <div className={styles.done} role="status">
        <h2 className="h3">Thank you, your enquiry has been sent.</h2>
        <p>We will reply to arrange a first conversation.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
        {errors.name && <p id="name-error" className={styles.error}>{errors.name}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="contact">Email or phone</label>
        <input id="contact" name="contact" autoComplete="email" aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'contact-error' : undefined} />
        {errors.contact && <p id="contact-error" className={styles.error}>{errors.contact}</p>}
      </div>
      <fieldset className={styles.field} data-invalid={!!errors.type} aria-describedby={errors.type ? 'type-error' : undefined}>
        <legend>Type of project</legend>
        <div className={styles.choices}>
          {TYPES.map((t) => (
            <label key={t} className={styles.choice}><input type="radio" name="type" value={t} /> {t}</label>
          ))}
        </div>
        {errors.type && <p id="type-error" className={styles.error}>{errors.type}</p>}
      </fieldset>
      <div className={styles.field}>
        <label htmlFor="location">Community or location <span className={styles.optional}>(optional)</span></label>
        <input id="location" name="location" />
      </div>
      <div className={styles.field}>
        <label htmlFor="message">Tell us about the space <span className={styles.optional}>(optional)</span></label>
        <textarea id="message" name="message" rows={4} maxLength={2000} />
      </div>
      {/* Honeypot: hidden from people, often filled by bots */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="company">Leave this empty</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={styles.field} data-invalid={!!errors.consent}>
        <label className={styles.consent}>
          <input type="checkbox" name="consent" value="yes" aria-describedby={errors.consent ? 'consent-error' : undefined} />
          <span>I agree to Archió using these details to reply to my enquiry. They are not shared or used for marketing.</span>
        </label>
        {errors.consent && <p id="consent-error" className={styles.error}>{errors.consent}</p>}
      </div>
      <button type="submit" className="btn btn--solid" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send enquiry'}</button>
      <p className={styles.status} role="status">
        {state === 'failed' && <>Sorry, your enquiry could not be sent. Please message us on <a href={site.whatsappHref}>WhatsApp</a> or email <a href={`mailto:${site.email}`}>{site.email}</a>.</>}
      </p>
    </form>
  );
}
