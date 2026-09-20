import BrandMark from "@/components/global/BrandMark";
import NotFoundActions from "@/components/ui/NotFoundActions";
import { getEditablePage } from "@/lib/page-content";

export default async function NotFound() {
  const copy = (await getEditablePage("not-found")).content.notFound;

  return (
    <main className="not-found-page" id="main-content" tabIndex={-1}>
      <div aria-hidden="true" className="not-found-page__glow not-found-page__glow--one" />
      <div aria-hidden="true" className="not-found-page__glow not-found-page__glow--two" />
      <div className="container not-found-page__container">
        <div className="not-found-page__card">
          <div className="not-found-page__brand">
            <BrandMark />
          </div>

          <p aria-hidden="true" className="not-found-page__code">
            {copy.code}<span>.</span>
          </p>
          <h1>{copy.title}</h1>
          <p className="not-found-page__copy">{copy.text}</p>
          <NotFoundActions copy={copy} />
        </div>
      </div>
    </main>
  );
}
