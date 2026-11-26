import { Button } from "../actions/Button.jsx";
import { ActionGroup } from "../layout/ActionGroup.jsx";
import { Field } from "./Field.jsx";
import "./RecordForm.css";

export function RecordForm({
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  busy = false,
  error,
}) {
  function change(key, field, value) {
    const next =
      field.type === "number" && value !== "" ? Number(value) : value;
    onChange({ ...values, [key]: next });
  }
  return (
    <form
      className="db-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      {fields.map(({ key, disabled, ...field }) => (
        <Field
          key={key}
          {...field}
          disabled={busy || disabled}
          value={values[key] ?? ""}
          onChange={(event) => change(key, field, event.target.value)}
        />
      ))}
      {error && <p role="alert">{error}</p>}
      <ActionGroup>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
        )}
      </ActionGroup>
    </form>
  );
}
