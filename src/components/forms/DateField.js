"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CalendarIcon(props) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 1.75V4M14.5 1.75V4M2.75 7.25H17.25M4.5 3H15.5C16.4665 3 17.25 3.7835 17.25 4.75V15.5C17.25 16.4665 16.4665 17.25 15.5 17.25H4.5C3.5335 17.25 2.75 16.4665 2.75 15.5V4.75C2.75 3.7835 3.5335 3 4.5 3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

function isoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateField({
  describedBy,
  error,
  icon = <CalendarIcon />,
  id,
  name,
  onChange,
  required,
  value,
}) {
  return (
    <DatePicker
      aria-describedby={describedBy}
      aria-invalid={error ? "true" : undefined}
      aria-required={required ? "true" : undefined}
      autoComplete="off"
      calendarClassName="site-date-picker__calendar"
      calendarIconClassName="site-date-picker__icon"
      className="site-date-picker__input"
      dateFormat="dd/MM/yyyy"
      icon={icon}
      id={id}
      name={name}
      onChange={(date) => onChange(isoDate(date))}
      placeholderText="DD/MM/YYYY"
      popperClassName="site-date-picker__popper"
      required={required}
      selected={parseDate(value)}
      showIcon
      strictParsing
      toggleCalendarOnIconClick
    />
  );
}
