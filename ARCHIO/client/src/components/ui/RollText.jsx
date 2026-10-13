export default function RollText({ children }) {
  return (
    <span className="roll">
      <span data-text={children}>{children}</span>
    </span>
  );
}
