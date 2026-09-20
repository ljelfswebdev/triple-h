import SiteImage from "./SiteImage";

export function SiteLoader({ logo, visible = true }) {
  if (!visible) return null;

  return (
    <div aria-label="Loading site" className="site-loader" role="status">
      {logo ? (
        <SiteImage
          alt=""
          className="site-loader__logo"
          height={80}
          src={logo}
          width={160}
        />
      ) : (
        <span aria-hidden="true" className="site-loader__mark" />
      )}
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}

export function LoadingOverlay({ label = "Loading", visible = true }) {
  if (!visible) return null;

  return (
    <div aria-label={label} className="loading-overlay" role="status">
      <span aria-hidden="true" className="loading-overlay__spinner" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
