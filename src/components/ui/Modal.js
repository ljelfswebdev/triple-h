"use client";

import { useEffect, useId, useRef } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function Modal({
  button,
  children,
  className = "",
  closeOnBackdrop = true,
  onClose,
  open,
  text,
  title,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = [...dialog.querySelectorAll(focusableSelector)];
    (focusable[0] || dialog).focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const controls = [...dialog.querySelectorAll(focusableSelector)];
      if (!controls.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="modal"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
        className={`modal__card ${className}`.trim()}
        ref={dialogRef}
        role="dialog"
        tabIndex="-1"
      >
        <div className="absolute top-3 right-3">
          <button
            aria-label="Close dialog"
            className="btn btn-black-outline btn-small"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {title && (
          <h2 className="h4" id={titleId}>
            {title}
          </h2>
        )}
        {text && <p>{text}</p>}
        {children}
        {button}
      </div>
    </div>
  );
}
