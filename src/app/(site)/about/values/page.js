import PageHero from "@/components/sections/triple-h/PageHero";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("values"); }

export default async function ValuesPage() {
  const { content } = await getEditablePage("values");
  const { hero, editorial } = content;
  return <main id="main-content" tabIndex={-1}><PageHero eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} imageAlt={hero.image?.alt} text={hero.text} title={hero.title} /><section className="section-large values-editorial"><div className="container"><div className="values-editorial__copy" dangerouslySetInnerHTML={{ __html: editorial.body }} /></div></section></main>;
}
