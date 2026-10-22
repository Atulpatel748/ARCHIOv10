import Field, { describedBy, useFieldIds } from './Field.jsx';

export default function Textarea({ label, hint, error, optional, full, className = '', ...props }) {
  const ids = useFieldIds();
  return (
    <Field ids={ids} label={label} hint={hint} error={error} optional={optional} full={full}>
      <textarea
        id={ids.id}
        className={`textarea ${className}`.trim()}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        {...props}
      />
    </Field>
  );
}
