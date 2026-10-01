import TestimonialsGrid from "@/components/about/TestimonialsGrid";
import PageHero from "@/components/sections/triple-h/PageHero";
import { RichCopy } from "@/components/sections/shared/Content";
import { getContentCollection } from "@/lib/content-items";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("testimonials"); }

export default async function TestimonialsPage() {
  const [testimonials, page] = await Promise.all([getContentCollection("testimonial"), getEditablePage("testimonials")]);
  const { hero, intro } = page.content;
  return <main className="testimonials-page-shell" id="main-content" tabIndex={-1}><PageHero eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} imageAlt={hero.image?.alt} text={hero.text} title={hero.title} /><section className="section-large testimonials-page"><div className="container"><div className="section-heading section-heading--split"><div><p className="eyebrow">{intro.eyebrow}</p><h2>{intro.title}</h2></div><RichCopy html={intro.text} /></div><TestimonialsGrid testimonials={testimonials} /></div></section></main>;
}
