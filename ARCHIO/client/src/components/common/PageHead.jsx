export default function PageHead({ title, size = 'lg', display = false, children }) {
  const titleClass = display ? 'page-head__display' : size === 'md' ? 't-h2' : undefined;
  return (
    <header className={`container page-head stack${display ? ' page-head--display' : ''}`}>
      <h1 className={titleClass}>{title}</h1>
      {children}
    </header>
  );
}
