import { RichCopy } from "./Content";

export default function LegalPage({ page }) {
  return (
    <main id="main-content">
      <article className="container py-[var(--section-padding-large)] [--container-width:920px]">
        <h1 className="mt-0 mb-10">{page?.content?.title}</h1>
        <RichCopy html={page?.content?.body} />
      </article>
    </main>
  );
}
