import { useId } from 'react';

export function useFieldIds() {
  const id = useId();
  return { id, hintId: `${id}-hint`, errorId: `${id}-error` };
}

export const describedBy = ({ hintId, errorId }, { hint, error }) =>
  [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

export default function Field({ ids, label, hint, error, optional, full, children }) {
  return (
    <div className={`field${full ? ' field--full' : ''}`}>
      <label className="field__label" htmlFor={ids.id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      {children}
      {hint && <p className="field__hint" id={ids.hintId}>{hint}</p>}
      {error && <p className="field__error" id={ids.errorId}>{error}</p>}
    </div>
  );
}
