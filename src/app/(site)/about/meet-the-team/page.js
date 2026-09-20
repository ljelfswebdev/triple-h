import TeamGrid from "@/components/about/TeamGrid";
import PageHero from "@/components/sections/triple-h/PageHero";
import { getContentCollection } from "@/lib/content-items";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("meet-the-team"); }

export default async function MeetTheTeamPage() {
  const [members, page] = await Promise.all([getContentCollection("team-member"), getEditablePage("meet-the-team")]);
  const { hero, intro } = page.content;
  return <main id="main-content" tabIndex={-1}><PageHero eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} text={hero.text} title={hero.title} /><section className="section-large team-section"><div className="container"><div className="section-heading section-heading--split"><div><p className="eyebrow">{intro.eyebrow}</p><h2>{intro.title}</h2></div><p>{intro.text}</p></div><TeamGrid members={members} /></div></section></main>;
}
