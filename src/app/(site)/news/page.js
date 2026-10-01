import NewsArchive from "@/components/news/NewsArchive";
import PageHero from "@/components/sections/triple-h/PageHero";
import { getContentCollection } from "@/lib/content-items";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("news"); }

export default async function NewsPage() {
  const [items, page] = await Promise.all([getContentCollection("news"), getEditablePage("news")]);
  const { hero, filters } = page.content;
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero
        eyebrow={hero.eyebrow}
        image={pageMediaUrl(hero.image)}
        imageAlt={hero.image?.alt}
        text={hero.text}
        title={hero.title}
      />
      <section className="section-large news-archive-section">
        <div className="container"><NewsArchive copy={filters} items={items} /></div>
      </section>
    </main>
  );
}
