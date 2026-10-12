export default function Spinner({ label }) {
  return (
    <>
      <span className="spinner" aria-hidden="true" />
      {label && <span className="visually-hidden">{label}</span>}
    </>
  );
}
