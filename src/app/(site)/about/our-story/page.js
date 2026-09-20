import Image from "next/image";
import PageHero from "@/components/sections/triple-h/PageHero";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("our-story"); }

export default async function OurStoryPage() {
  const { content } = await getEditablePage("our-story");
  const { hero, editorial } = content;
  return <main id="main-content" tabIndex={-1}><PageHero eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} text={hero.text} title={hero.title} /><section className="section-large"><div className="container about-editorial"><div className="about-editorial__copy" dangerouslySetInnerHTML={{ __html: editorial.body }} /><div className="about-editorial__media"><Image alt={hero.image?.alt || hero.title} fill sizes="(max-width: 1080px) 100vw, 42vw" src={pageMediaUrl(hero.image)} /></div></div></section></main>;
}
