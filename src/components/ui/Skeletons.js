export function SkeletonLine({ width = "100%" }) {
  return (
    <span
      aria-hidden="true"
      className="skeleton skeleton--line"
      style={{ width }}
    />
  );
}

export function SkeletonImage({ aspectRatio = "16 / 9" }) {
  return (
    <span
      aria-hidden="true"
      className="skeleton skeleton--image"
      style={{ aspectRatio }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div aria-hidden="true" className="skeleton-card">
      <SkeletonImage />
      <SkeletonLine width="70%" />
      <SkeletonLine />
      <SkeletonLine width="85%" />
    </div>
  );
}
