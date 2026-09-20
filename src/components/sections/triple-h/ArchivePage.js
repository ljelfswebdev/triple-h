import CollectionGrid from "./CollectionGrid";
import PageHero from "./PageHero";

export default function ArchivePage({ eyebrow, title, text, image, items, basePath }) {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero eyebrow={eyebrow} image={image} text={text} title={title} />
      <section className="section-large"><div className="container"><CollectionGrid basePath={basePath} items={items} /></div></section>
    </main>
  );
}
