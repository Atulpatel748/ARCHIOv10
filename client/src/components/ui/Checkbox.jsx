import { useFieldIds } from './Field.jsx';

export default function Checkbox({ label, error, full, checked, ...props }) {
  const { id, errorId } = useFieldIds();
  return (
    <div className={`field${full ? ' field--full' : ''}`}>
      <div className="check">
        <input id={id} type="checkbox" checked={Boolean(checked)} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? errorId : undefined} {...props} />
        <label htmlFor={id}>{label}</label>
      </div>
      {error && <p className="field__error" id={errorId}>{error}</p>}
    </div>
  );
}
