import ArchivePage from "@/components/sections/triple-h/ArchivePage";
import { getContentCollection } from "@/lib/content-items";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";

export async function generateMetadata() { return getEditablePageMetadata("services"); }
export default async function ServicesPage() {
  const [items, page] = await Promise.all([getContentCollection("service"), getEditablePage("services")]);
  const hero = page.content.hero;
  return <ArchivePage basePath="/services" eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} items={items} text={hero.text} title={hero.title} />;
}
