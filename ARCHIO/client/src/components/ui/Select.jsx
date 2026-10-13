import Field, { describedBy, useFieldIds } from './Field.jsx';

export default function Select({ label, hint, error, optional, full, options, placeholder = 'Select an option', className = '', ...props }) {
  const ids = useFieldIds();
  return (
    <Field ids={ids} label={label} hint={hint} error={error} optional={optional} full={full}>
      <select
        id={ids.id}
        className={`select ${className}`.trim()}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(ids, { hint, error })}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </Field>
  );
}
