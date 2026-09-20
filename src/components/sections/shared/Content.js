export function RichCopy({ className = "", html }) {
  return html ? <div className={`text-block ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} /> : null;
}

export function ContentLink({ link, variant = "btn-white-outline" }) {
  const href = link?.url?.trim();
  const label = link?.label?.trim();
  if (!href || !label) return null;
  return <a className={`btn ${variant}`} href={href} target={link.newTab ? "_blank" : undefined} rel={link.newTab ? "noreferrer" : undefined}>{label}</a>;
}
