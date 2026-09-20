import PageHero from "@/components/sections/triple-h/PageHero";
import QuickEnquiry from "@/components/forms/QuickEnquiry";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";
import { getGlobals } from "@/lib/site-data";

export async function generateMetadata() { return getEditablePageMetadata("contact"); }
export default async function ContactPage() { const [{ content }, globals] = await Promise.all([getEditablePage("contact"), getGlobals()]); const { hero, contact } = content; return <main id="main-content" tabIndex={-1}><PageHero eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} text={hero.text} title={hero.title} /><section className="section-large"><div className="container contact-layout"><div className="contact-card"><p className="eyebrow">{contact.eyebrow}</p><h2>{contact.title}</h2><a className="contact-card__link" href={`tel:${globals.contact.number.replace(/[^\d+]/g, "")}`}>{globals.contact.number}</a><a className="contact-card__link" href={`mailto:${globals.contact.email}`}>{globals.contact.email}</a><div dangerouslySetInnerHTML={{ __html: globals.contact.address }} /><div className="emergency-note"><strong>{contact.emergencyTitle}</strong><span>{contact.emergencyText}</span></div></div><div><QuickEnquiry /></div></div></section></main>; }
