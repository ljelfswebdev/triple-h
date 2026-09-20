import { notFound } from "next/navigation";
import DetailPage from "@/components/sections/triple-h/DetailPage";
import { getContentCollection, getContentItem } from "@/lib/content-items";
import { createContentMetadata } from "@/lib/metadata";
export async function generateStaticParams() { return (await getContentCollection("news")).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) { const { slug } = await params; return createContentMetadata(await getContentItem("news", slug)); }
export default async function NewsDetailPage({ params }) { const { slug } = await params; const item = await getContentItem("news", slug); if (!item) notFound(); return <DetailPage item={item} kind="news" />; }
