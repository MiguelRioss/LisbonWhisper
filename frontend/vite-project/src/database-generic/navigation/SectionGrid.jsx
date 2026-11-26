import "./SectionGrid.css";
import { Button } from "../actions/Button.jsx";
export function SectionGrid({ sections, selected, onSelect }) {
  return (
    <nav className="db-grid" aria-label="Sections">
      {sections.map((section) => (
        <Button
          type="button"
          key={section.id}
          className={`db-tile ${selected === section.id ? "db-tile--active" : ""}`}
          aria-pressed={selected === section.id}
          onClick={() => onSelect(section.id)}
        >
          {section.icon && (
            <span className="db-tile__icon" aria-hidden="true">
              {section.icon}
            </span>
          )}
          <span>
            <strong className="db-tile__title">{section.title}</strong>
            <span className="db-tile__subtitle">{section.description}</span>
          </span>
        </Button>
      ))}
    </nav>
  );
}
