import { useId } from "react";
import "./Field.css";

export function Field({ label, hint, options, type = "text", id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  return (
    <div className="db-field">
      <label htmlFor={inputId}>{label}</label>
      {options ? (
        <select id={inputId} aria-describedby={hintId} {...props}>
          <option value="">Choose…</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={inputId} type={type} aria-describedby={hintId} {...props} />
      )}
      {hint && (
        <small id={hintId} className="db-muted">
          {hint}
        </small>
      )}
    </div>
  );
}
