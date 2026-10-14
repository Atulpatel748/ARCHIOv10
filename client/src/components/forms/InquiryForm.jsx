import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  BUDGET_RANGES, INQUIRY_PROJECT_TYPES, LIMITS, PROPERTY_TYPES, TIMELINES, inquiryCreateSchema,
} from '../../schemas/index.js';
import { ROUTES } from '../../constants/routes.js';
import { useForm } from '../../hooks/useForm.js';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning.js';
import { inquiryService } from '../../services/inquiry.service.js';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Textarea from '../ui/Textarea.jsx';

const STEPS = [
  { title: 'About you', fields: ['name', 'email', 'phone', 'city'] },
  { title: 'Your space', fields: ['projectType', 'propertyType', 'areaSqm', 'budgetRange', 'timeline'] },
  { title: 'Details', fields: ['message', 'consent'] },
];

const toPayload = (values) => ({ ...values, areaSqm: values.areaSqm === '' ? undefined : Number(values.areaSqm) });

function SentPanel() {
  const headingRef = useRef(null);
  // The form that had focus has just been replaced, so move focus to the confirmation.
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="stack" role="status">
      <h2 className="t-h2" tabIndex={-1} ref={headingRef}>Thank you</h2>
      <p className="t-lead">We have your request and will reply within two working days.</p>
      <div className="cluster">
        <Button to={ROUTES.projects} variant="secondary">Browse projects</Button>
      </div>
    </div>
  );
}

export default function InquiryForm() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const headingRef = useRef(null);
  const mounted = useRef(false);

  const form = useForm({
    schema: inquiryCreateSchema,
    toPayload,
    initialValues: {
      name: '', email: '', phone: '', city: '', projectType: '', propertyType: '',
      areaSqm: '', budgetRange: '', timeline: '', message: '', consent: false, website: '',
    },
    onSubmit: async (data) => {
      const result = await inquiryService.create(data);
      if (result.ok) setSent(true);
      return result; // a failure carries the message the form shows
    },
  });

  useUnsavedChangesWarning(form.dirty && !form.submitting);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const failing = Object.keys(form.errors);
    const earliest = STEPS.findIndex((item) => item.fields.some((name) => failing.includes(name)));
    if (earliest !== -1 && earliest < step) setStep(earliest);
  }, [form.errors, step]);

  if (sent) return <SentPanel />;

  const last = step === STEPS.length - 1;
  const onSubmit = (event) => {
    if (last) return form.handleSubmit(event);
    event.preventDefault();
    if (form.validateFields(STEPS[step].fields)) setStep(step + 1);
    return undefined;
  };

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Project inquiry">
      <ol className="stepper" aria-label="Progress">
        {STEPS.map((item, index) => (
          <li key={item.title} aria-current={index === step ? 'step' : undefined} data-done={index < step}>
            {index + 1}. {item.title}
          </li>
        ))}
      </ol>
      <h2 className="t-h3 visually-hidden" tabIndex={-1} ref={headingRef}>
        Step {step + 1} of {STEPS.length}: {STEPS[step].title}
      </h2>

      <div className="form-grid">
        {step === 0 && (
          <>
            <Input label="Full name" autoComplete="name" {...form.field('name')} />
            <Input label="Email" type="email" autoComplete="email" {...form.field('email')} />
            <Input label="Phone" type="tel" autoComplete="tel" optional {...form.field('phone')} />
            <Input label="City" autoComplete="address-level2" optional hint="Where the property is located." {...form.field('city')} />
          </>
        )}
        {step === 1 && (
          <>
            <Select label="What do you need?" options={INQUIRY_PROJECT_TYPES} {...form.field('projectType')} />
            <Select label="Property type" options={PROPERTY_TYPES} {...form.field('propertyType')} />
            <Input label="Approximate area (m²)" type="number" inputMode="decimal" min="5" optional {...form.field('areaSqm')} />
            <Select label="Budget range" options={BUDGET_RANGES} {...form.field('budgetRange')} />
            <Select label="When would you like to start?" options={TIMELINES} full {...form.field('timeline')} />
          </>
        )}
        {step === 2 && (
          <>
            <Textarea
              label="Tell us about your space"
              full
              maxLength={LIMITS.MESSAGE_MAX}
              hint={`What works, what does not, and what you would like to change. ${form.values.message.length}/${LIMITS.MESSAGE_MAX}`}
              {...form.field('message')}
            />
            <Checkbox
              full
              label={<>I have read the <Link className="link" to={ROUTES.privacy} target="_blank">privacy notice</Link> and agree to be contacted about this request.</>}
              name="consent"
              checked={form.values.consent}
              onChange={form.handleChange}
              error={form.errors.consent}
            />
            <div className="hp-field" aria-hidden="true">
              <label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" value={form.values.website} onChange={form.handleChange} /></label>
            </div>
          </>
        )}
      </div>

      {form.formError && <div className="form-actions"><Alert tone="error">{form.formError}</Alert></div>}
      <div className="form-actions">
        {step > 0 ? <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button> : <span />}
        <Button type="submit" loading={form.submitting}>{last ? 'Send me a quote' : 'Next'}</Button>
      </div>
    </form>
  );
}
