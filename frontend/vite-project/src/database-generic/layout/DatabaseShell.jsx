import "./DatabaseShell.css";
import { SectionGrid } from "../navigation/SectionGrid.jsx";
export function DatabaseShell({
  as: Container = "main",
  title = "Database",
  description,
  sections,
  selected,
  onSelect,
  headerActions,
  brand,
  children,
}) {
  return (
    <div className="database-ui">
      <Container className="db-page">
        {brand && <div className="db-brand">{brand}</div>}
        <header className="db-header">
          <div>
            <h1>{title}</h1>
            {description && <p className="db-muted">{description}</p>}
          </div>
          {headerActions}
        </header>
        {sections?.length > 0 && (
          <SectionGrid sections={sections} selected={selected} onSelect={onSelect} />
        )}
        <section className="db-content">{children}</section>
      </Container>
    </div>
  );
}
