import { notFound } from "next/navigation";
import DetailPage from "@/components/sections/triple-h/DetailPage";
import { getContentCollection, getContentItem } from "@/lib/content-items";
import { createContentMetadata } from "@/lib/metadata";
export async function generateStaticParams() { return (await getContentCollection("project")).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) { const { slug } = await params; return createContentMetadata(await getContentItem("project", slug)); }
export default async function ProjectPage({ params }) { const { slug } = await params; const item = await getContentItem("project", slug); if (!item) notFound(); return <DetailPage item={item} kind="project" />; }
