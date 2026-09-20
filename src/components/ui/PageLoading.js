import { SkeletonLine } from "@/components/ui/Skeletons";

export default function PageLoading() {
  return (
    <main aria-label="Loading page" className="section-large" role="status">
      <div className="container">
        <div className="loading-page">
          <SkeletonLine width="45%" />
          <SkeletonLine />
          <SkeletonLine width="80%" />
        </div>
        <span className="visually-hidden">Loading…</span>
      </div>
    </main>
  );
}
