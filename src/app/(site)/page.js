import HomePage from "@/components/sections/triple-h/HomePage";
import { getContentCollection } from "@/lib/content-items";
import { getEditablePage, getEditablePageMetadata } from "@/lib/page-content";
import { getGlobals } from "@/lib/site-data";

export async function generateMetadata() {
  return getEditablePageMetadata("homepage");
}

export default async function Home() {
  const [serviceItems, projectItems, newsItems, vacancyItems, page, globals] = await Promise.all([
    getContentCollection("service"), getContentCollection("project"), getContentCollection("news"), getContentCollection("vacancy"),
    getEditablePage("homepage"),
    getGlobals(),
  ]);
  return <HomePage contact={globals.contact} content={page.content} news={newsItems.slice(0, 3)} projects={projectItems.slice(0, 3)} services={serviceItems} vacancies={vacancyItems} />;
}
