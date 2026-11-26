import "./Button.css";
import "./Button.css";

export function Button({
  variant = "secondary",
  size = "medium",
  align = "center",
  fullWidth = false,
  icon,
  iconPosition = "start",
  className = "",
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`db-button db-button--${variant} db-button--${size} db-button--align-${align} ${fullWidth ? "db-button--full" : ""} ${className}`}
      {...props}
    >
      {icon && iconPosition === "start" && (
        <span aria-hidden="true">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "end" && <span aria-hidden="true">{icon}</span>}
    </button>
  );
}
