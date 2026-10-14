import { Link } from 'react-router';
import RollText from './RollText.jsx';
import Spinner from './Spinner.jsx';

const classes = ({ variant, size, block, className }) =>
  ['btn', variant !== 'primary' && `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');

export default function Button({
  variant = 'primary', size = 'md', block = false, loading = false, disabled, to, href, type = 'button', className, children, ...rest
}) {
  const label = typeof children === 'string' ? <RollText>{children}</RollText> : children;
  const shared = { className: classes({ variant, size, block, className }), ...rest };

  if (to) return <Link to={to} {...shared}>{label}</Link>;
  if (href) return <a href={href} {...shared}>{label}</a>;
  return (
    <button type={type} disabled={loading || disabled} aria-busy={loading || undefined} {...shared}>
      {loading && <Spinner />}
      {label}
    </button>
  );
}
