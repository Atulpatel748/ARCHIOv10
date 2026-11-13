'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { isValidContact, TYPES } from '@/content/contact';
import { site } from '@/content/site';
import styles from './ContactForm.module.scss';

// Cloudflare Turnstile runs only when its site key is set. Its script is fetched the first time someone uses the form,
// so the page (and Lighthouse, which never touches the form) loads nothing from Cloudflare until then.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
type Turnstile = { render(el: HTMLElement, options: object): string; execute(id: string): void; reset(id: string): void; remove(id: string): void };
declare global { interface Window { turnstile?: Turnstile } }

let script: Promise<Turnstile> | undefined;
function loadTurnstile() {
  script ??= new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    el.async = true;
    const fail = () => {
      script = undefined; // let the next attempt try again
      el.remove();
      reject(new Error('turnstile did not load'));
    };
    const stalled = setTimeout(fail, 15_000);
    el.onload = () => {
      clearTimeout(stalled);
      if (window.turnstile) resolve(window.turnstile);
      else fail();
    };
    el.onerror = () => {
      clearTimeout(stalled);
      fail();
    };
    document.head.append(el);
  });
  return script;
}

type Errors = Partial<Record<'name' | 'contact' | 'type' | 'consent', string>>;
const FIELD_NAMES = { name: 'Name', contact: 'Email or phone', type: 'Type of project', consent: 'the consent box' };

function validate(data: FormData): Errors {
  const errors: Errors = {};
  const name = String(data.get('name') ?? '').trim();
  const contact = String(data.get('contact') ?? '').trim();
  if (name.length < 2) errors.name = 'Please enter your name.';
  if (!isValidContact(contact)) errors.contact = 'Enter an email address or phone number we can reply to.';
  if (!data.get('type')) errors.type = 'Choose the type of project closest to yours.';
  if (!data.get('consent')) errors.consent = 'Tick the box to confirm, so we can reply to you.';
  return errors;
}

export default function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'captcha'>('idle');
  const [askHuman, setAskHuman] = useState(false); // Turnstile wants a click before it will pass the form
  const box = useRef<HTMLDivElement>(null);
  const captcha = useRef<{ ready?: Promise<string>; id?: string; pending?: { resolve: (token: string) => void; reject: (error: Error) => void } }>({});

  // The widget waits for execute() on submit, so the check runs once the visitor has filled the form in.
  function prepare() {
    const c = captcha.current;
    if (!SITE_KEY || c.ready) return c.ready;
    c.ready = loadTurnstile().then((turnstile) => {
      if (!box.current) throw new Error('form is gone');
      c.id = turnstile.render(box.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        appearance: 'interaction-only',
        execution: 'execute',
        callback: (token: string) => c.pending?.resolve(token),
        'error-callback': (code: string) => {
          c.pending?.reject(new Error(`turnstile error ${code}`));
          return true; // handled here, so Turnstile does not log it too
        },
        'timeout-callback': () => c.pending?.reject(new Error('turnstile timed out')),
        'before-interactive-callback': () => setAskHuman(true),
        'after-interactive-callback': () => setAskHuman(false),
      });
      return c.id;
    });
    c.ready.catch(() => { c.ready = undefined; }); // the submit shows the error; the next one tries again
    return c.ready;
  }

  async function captchaToken() {
    const id = await prepare();
    const { turnstile } = window;
    if (!id || !turnstile) throw new Error('turnstile unavailable');
    return new Promise<string>((resolve, reject) => {
      captcha.current.pending = { resolve, reject };
      turnstile.execute(id);
    });
  }

  useEffect(() => {
    const c = captcha.current;
    return () => {
      if (c.id) window.turnstile?.remove(c.id);
    };
  }, []);

  // After a send the form is replaced by the thank-you note: move focus to it so keyboard and screen-reader users hear that it worked.
  const done = useRef<HTMLDivElement>(null);
  useEffect(() => { if (state === 'sent') done.current?.focus(); }, [state]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending') return; // the button is aria-disabled, not disabled, so it keeps focus while sending
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      const field = form.elements.namedItem(firstInvalid);
      const el = (field instanceof RadioNodeList ? field[0] : field) as HTMLElement | null;
      el?.focus({ preventScroll: true });
      // Scrolled by the page's smooth scroll when it runs, so the two do not fight and leave the field off screen
      const lenis = (window as unknown as { lenis?: { scrollTo(t: HTMLElement, o: object): void } }).lenis;
      if (el && lenis) lenis.scrollTo(el, { offset: -160 }); else el?.scrollIntoView({ block: 'center' });
      return;
    }
    setState('sending');
    const fields: Record<string, FormDataEntryValue> = Object.fromEntries(data);
    try {
      if (SITE_KEY) {
        try {
          fields.turnstileToken = await captchaToken();
        } catch (error) {
          console.error('contact form: security check failed:', (error as Error).message);
          setState('captcha');
          return;
        }
      }
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string };
        setState(error?.startsWith('captcha') ? 'captcha' : 'failed');
        return;
      }
      if (captcha.current.id) window.turnstile?.remove(captcha.current.id); // the form goes away
      // Cleared on the same object, not replaced: the unmount cleanup holds this object and must not remove the widget a second time.
      captcha.current.id = undefined;
      captcha.current.ready = undefined;
      setState('sent');
      form.reset();
    } catch {
      setState('failed');
    } finally {
      const { id } = captcha.current;
      if (id) window.turnstile?.reset(id); // a token is good for one check only
    }
  }

  const invalid = Object.keys(errors) as (keyof Errors)[];
  // An error goes as soon as its field is put right, not only at the next send; a field that is still wrong keeps its message.
  function clearFixed(e: React.ChangeEvent<HTMLFormElement>) {
    if (!invalid.length) return;
    const now = validate(new FormData(e.currentTarget));
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => now[k as keyof Errors])) as Errors);
  }

  if (state === 'sent') {
    return (
      <div ref={done} tabIndex={-1} className={styles.done} role="status">
        <h2 className="h3">Thank you. Your enquiry has been sent.</h2>
        <p>We will reply to the contact details you gave, to arrange a first conversation.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} onFocus={() => { prepare(); }} onChange={clearFixed} noValidate>
      <div className={styles.field}>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" autoComplete="name" maxLength={100} required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
        {errors.name && <p id="name-error" className={styles.error}>{errors.name}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="contact">Email or phone</label>
        <p id="contact-hint" className={styles.hint}>Email, or a phone number with country code.</p>
        <input id="contact" name="contact" autoComplete="email" spellCheck={false} autoCapitalize="none" maxLength={120} required aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'contact-hint contact-error' : 'contact-hint'} />
        {errors.contact && <p id="contact-error" className={styles.error}>{errors.contact}</p>}
      </div>
      {/* The error is tied to each radio, not the fieldset: aria-describedby on a fieldset is not read out reliably. */}
      <fieldset className={styles.field} data-invalid={!!errors.type}>
        <legend>Type of project</legend>
        <div className={styles.choices}>
          {TYPES.map((t) => (
            <label key={t} className={styles.choice}><input type="radio" name="type" value={t} required={t === TYPES[0]} aria-describedby={errors.type ? 'type-error' : undefined} /> {t}</label>
          ))}
        </div>
        {errors.type && <p id="type-error" className={styles.error}>{errors.type}</p>}
      </fieldset>
      <div className={styles.field}>
        <label htmlFor="location">Community or location <span className={styles.optional}>(optional)</span></label>
        <input id="location" name="location" maxLength={120} />
      </div>
      <div className={styles.field}>
        <label htmlFor="message">About the space <span className={styles.optional}>(optional)</span></label>
        <p id="message-hint" className={styles.hint}>For example: the property, what you want to change, and when.</p>
        <textarea id="message" name="message" rows={4} maxLength={2000} aria-describedby="message-hint" />
      </div>
      {/* Honeypot: hidden from people, often filled by bots */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="company">Leave this empty</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={styles.field} data-invalid={!!errors.consent}>
        <label className={styles.consent}>
          <input type="checkbox" name="consent" value="yes" required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-error' : undefined} />
          <span>I agree to Archió using these details to reply to my enquiry.</span>
        </label>
        <p className={styles.privacyLink}>Read our <Link prefetch={false} href="/privacy">Privacy Notice</Link>.</p>
        {errors.consent && <p id="consent-error" className={styles.error}>{errors.consent}</p>}
        {/* Turnstile draws here only if it needs the visitor to click; otherwise it takes no room. */}
        {SITE_KEY && <div ref={box} />}
      </div>
      <button type="submit" className="btn btn--light" aria-disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
      <p className={styles.alt}>Prefer to message? <a href={site.whatsappHref}>WhatsApp us</a>.</p>
      <p className={styles.status} role="status">
        {state === 'idle' && invalid.length > 0 && <>{invalid.length === 1 ? '1 field needs' : `${invalid.length} fields need`} attention: {invalid.map((k) => FIELD_NAMES[k]).join(', ')}.</>}
        {state === 'sending' && (askHuman ? <>One more step: tick the box above to confirm you are a person. Your enquiry will then send.</> : <>Sending your enquiry…</>)}
        {state === 'captcha' && <>The security check did not complete. Your details are still in the form. Try sending again, or message us on <a href={site.whatsappHref}>WhatsApp</a> or by email at <a href={`mailto:${site.email}`}>{site.email}</a>.</>}
        {state === 'failed' && <>Your enquiry did not send. Your details are still in the form. Try again, or message us on <a href={site.whatsappHref}>WhatsApp</a> or by email at <a href={`mailto:${site.email}`}>{site.email}</a>.</>}
      </p>
    </form>
  );
}
