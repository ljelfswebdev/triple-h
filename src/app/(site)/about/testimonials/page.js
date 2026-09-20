import TestimonialsGrid from "@/components/about/TestimonialsGrid";
import PageHero from "@/components/sections/triple-h/PageHero";
import { getContentCollection } from "@/lib/content-items";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("testimonials"); }

export default async function TestimonialsPage() {
  const [testimonials, page] = await Promise.all([getContentCollection("testimonial"), getEditablePage("testimonials")]);
  const { hero, intro } = page.content;
  return <main className="testimonials-page-shell" id="main-content" tabIndex={-1}><PageHero eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} text={hero.text} title={hero.title} /><section className="section-large testimonials-page"><div className="container"><div className="section-heading section-heading--split"><div><p className="eyebrow">{intro.eyebrow}</p><h2>{intro.title}</h2></div><p>{intro.text}</p></div><TestimonialsGrid testimonials={testimonials} /></div></section></main>;
}
