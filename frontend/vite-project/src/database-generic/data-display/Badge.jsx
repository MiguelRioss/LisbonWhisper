import "./Badge.css";
export function Badge({ children, tone = "neutral" }) {
  return <span className={`db-badge db-badge--${tone}`}>{children}</span>;
}
