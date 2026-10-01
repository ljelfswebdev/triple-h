import ArchivePage from "@/components/sections/triple-h/ArchivePage";
import { getContentCollection } from "@/lib/content-items";
import { getEditablePage, getEditablePageMetadata, pageMediaUrl } from "@/lib/page-content";
export async function generateMetadata() { return getEditablePageMetadata("projects"); }
export default async function ProjectsPage() { const [items, page] = await Promise.all([getContentCollection("project"), getEditablePage("projects")]); const hero = page.content.hero; return <ArchivePage basePath="/projects" eyebrow={hero.eyebrow} image={pageMediaUrl(hero.image)} imageAlt={hero.image?.alt} items={items} text={hero.text} title={hero.title} />; }
