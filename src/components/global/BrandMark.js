import Link from "next/link";

export default function BrandMark({ linked = true, light = true }) {
  const mark = (
    <span className={`brand-mark${light ? " brand-mark--light" : ""}`}>
      <span className="brand-mark__triple">TRIPLE</span>
      <span className="brand-mark__h">H</span>
      <span className="brand-mark__name">Contracts &amp; Hire</span>
    </span>
  );
  return linked ? <Link href="/">{mark}</Link> : mark;
}
