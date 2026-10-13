import { useCallback, useMemo, useRef, useState } from 'react';
import { ApiError } from '../services/api.js';

const keyOf = (path) => path.map(String).join('.');

const errorsFromIssues = (issues) => {
  const errors = {};
  for (const issue of issues) errors[keyOf(issue.path) || '_form'] ??= issue.message;
  return errors;
};

const errorsFromDetails = (details) => Object.fromEntries(details.map(({ field, message }) => [field, message]));

export function useForm({ schema, initialValues, toPayload = (values) => values, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const inFlight = useRef(false);
  // `dirty` is true while the values differ from the last saved (or initial) state.
  const baseline = useRef(JSON.stringify(initialValues));
  const [baselineVersion, setBaselineVersion] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dirty = useMemo(() => JSON.stringify(values) !== baseline.current, [values, baselineVersion]);

  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const handleChange = useCallback(
    (event) => {
      const { name, type, checked, value } = event.target;
      setValue(name, type === 'checkbox' ? checked : value);
    },
    [setValue],
  );

  const validateFields = useCallback(
    (fields) => {
      const result = schema.safeParse(toPayload(values));
      const all = result.success ? {} : errorsFromIssues(result.error.issues);
      const scoped = Object.fromEntries(Object.entries(all).filter(([name]) => fields.includes(name.split('.')[0])));
      setErrors((current) => ({ ...current, ...scoped }));
      if (Object.keys(scoped).length) {
        requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      }
      return Object.keys(scoped).length === 0;
    },
    [schema, toPayload, values],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (inFlight.current) return;
      setFormError('');
      const form = event.currentTarget;
      const result = schema.safeParse(toPayload(values));
      if (!result.success) {
        setErrors(errorsFromIssues(result.error.issues));
        requestAnimationFrame(() => form.querySelector('[aria-invalid="true"]')?.focus());
        return;
      }
      inFlight.current = true;
      setSubmitting(true);
      try {
        await onSubmit(result.data);
        baseline.current = JSON.stringify(values);
        setBaselineVersion((version) => version + 1);
      } catch (error) {
        if (error instanceof ApiError && error.code === 'VALIDATION_ERROR' && error.details?.length) {
          const fieldErrors = errorsFromDetails(error.details);
          setErrors(fieldErrors);
          // A detail no field shows (e.g. after a deploy changed the schema) would leave a bare "attention" note.
          const shown = Object.keys(fieldErrors).some((name) => name.split('.')[0] in values);
          setFormError(shown ? 'Some fields need attention.' : error.details[0].message);
          requestAnimationFrame(() => form.querySelector('[aria-invalid="true"]')?.focus());
        } else if (error instanceof ApiError) {
          setFormError(error.message);
        } else {
          setFormError('Something went wrong. Please try again.');
        }
      } finally {
        inFlight.current = false;
        setSubmitting(false);
      }
    },
    [onSubmit, schema, toPayload, values],
  );

  const field = (name) => ({ name, value: values[name] ?? '', onChange: handleChange, error: errors[name] });

  return { values, errors, dirty, handleChange, handleSubmit, validateFields, submitting, formError, field };
}
