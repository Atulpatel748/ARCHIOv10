export default function Alert({ tone = 'info', children, ...props }) {
  const role = tone === 'error' ? 'alert' : 'status';
  return (
    <div className={`alert alert--${tone}`} role={role} {...props}>
      {children}
    </div>
  );
}
