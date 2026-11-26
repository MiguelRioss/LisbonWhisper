import "./Modal.css";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "../actions/Button.jsx";
export function Modal({ open, title = "Details", onClose, children }) {
  const dialog = useRef(null);
  const titleId = useId();
  function containTab(event) {
    if (event.key !== "Tab") return;
    const controls = [
      ...dialog.current.querySelectorAll(
        "button, input, select, textarea, a[href], [tabindex]",
      ),
    ].filter(
      (element) =>
        !element.disabled &&
        element.tabIndex >= 0 &&
        element.getClientRects().length,
    );
    const first = controls[0],
      last = controls.at(-1);
    const target =
      event.shiftKey && document.activeElement === first
        ? last
        : !event.shiftKey && document.activeElement === last
          ? first
          : null;
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const element = dialog.current;
    element.showModal();
    return () => {
      element.close();
      previous?.focus();
    };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <dialog
      className="database-ui db-dialog"
      ref={dialog}
      onKeyDown={containTab}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="db-modal-head">
        <h2 id={titleId}>{title}</h2>
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </header>
      <div className="db-modal-body">{children}</div>
    </dialog>,
    document.body,
  );
}
