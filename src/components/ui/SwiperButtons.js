export function ChevronLeft({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function ChevronRight({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function SwiperButton({ direction, disabled = false, icon, onClick, variant = "primary" }) {
  const isPrevious = direction === "previous";

  return (
    <button
      aria-label={`${isPrevious ? "Previous" : "Next"} slide`}
      className={`btn ${variant === "white" ? "btn-white" : "btn-primary"}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon ||
        (isPrevious ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        ))}
    </button>
  );
}

export default function SwiperButtons({
  className = "",
  disabled = false,
  nextIcon,
  onNext,
  onPrevious,
  previousIcon,
  variant = "primary",
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="pointer-events-auto inline-flex">
        <SwiperButton
          direction="previous"
          disabled={disabled}
          icon={previousIcon}
          variant={variant}
          onClick={onPrevious}
        />
      </span>
      <span className="pointer-events-auto inline-flex">
        <SwiperButton
          direction="next"
          disabled={disabled}
          icon={nextIcon}
          variant={variant}
          onClick={onNext}
        />
      </span>
    </div>
  );
}
