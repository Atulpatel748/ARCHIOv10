import Field, { describedBy, useFieldIds } from './Field.jsx';

export default function Input({ label, hint, error, optional, full, className = '', ...props }) {
  const ids = useFieldIds();
  return (
    <Field ids={ids} label={label} hint={hint} error={error} optional={optional} full={full}>
      <input
        id={ids.id}
        className={`input ${className}`.trim()}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        spellCheck={props.type === 'email' ? false : undefined}
        {...props}
      />
    </Field>
  );
}
