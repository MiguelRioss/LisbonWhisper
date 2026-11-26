export function Toolbar({ title, children }) {
  return (
    <div className="db-toolbar">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
