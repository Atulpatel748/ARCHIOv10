export default function EmptyState({ title, children, action }) {
  return (
    <div className="state">
      <h2 className="state__title">{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
