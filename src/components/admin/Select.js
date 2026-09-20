"use client";

import { useId } from "react";
import ReactSelect from "react-select";

const arrowColours = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  tertiary: "var(--color-tertiary)",
  black: "var(--color-black)",
  grey: "var(--color-grey)",
  white: "var(--color-white)",
};

function resolveArrowColour(arrow) {
  return arrowColours[arrow] || arrow;
}

export default function Select({
  arrow = "grey",
  error = false,
  inputId,
  instanceId,
  placeholder = "Please select",
  styles = {},
  ...props
}) {
  const generatedId = useId().replaceAll(":", "");
  const resolvedId = instanceId || inputId || `admin-select-${generatedId}`;
  const arrowColour = resolveArrowColour(arrow);

  function applyCustomStyles(name, base, state) {
    const customStyle = styles[name];
    return typeof customStyle === "function"
      ? customStyle(base, state)
      : { ...base, ...customStyle };
  }

  return (
    <ReactSelect
      {...props}
      aria-invalid={error || undefined}
      classNamePrefix="react-select"
      inputId={inputId || resolvedId}
      instanceId={resolvedId}
      placeholder={placeholder}
      styles={{
        ...styles,
        control: (base, state) => ({
          ...applyCustomStyles("control", base, state),
          minHeight: 48,
          borderColor: error
            ? "var(--color-error)"
            : state.isFocused
              ? "var(--color-primary)"
              : "var(--color-border)",
          borderRadius: "var(--radius-small)",
          boxShadow: state.isFocused ? "0 0 0 1px var(--color-primary)" : "none",
          "&:hover": {
            ...applyCustomStyles("control", base, state)["&:hover"],
            borderColor: error ? "var(--color-error)" : "var(--color-primary)",
          },
        }),
        dropdownIndicator: (base, state) => {
          const customStyles = applyCustomStyles("dropdownIndicator", base, state);

          return {
            ...customStyles,
            color: arrowColour,
            "&:hover": {
              ...customStyles["&:hover"],
              color: arrowColour,
            },
          };
        },
        menu: (base, state) => ({
          ...applyCustomStyles("menu", base, state),
          zIndex: "var(--z-dropdown)",
        }),
        option: (base, state) => ({
          ...applyCustomStyles("option", base, state),
          background: state.isSelected
            ? "var(--color-primary)"
            : state.isFocused
              ? "var(--color-surface)"
              : "var(--color-white)",
          color: state.isSelected ? "var(--color-white)" : "var(--color-black)",
          cursor: state.isDisabled ? "not-allowed" : "pointer",
        }),
        placeholder: (base, state) => ({
          ...applyCustomStyles("placeholder", base, state),
          color: "var(--color-grey)",
        }),
      }}
    />
  );
}
