import { notFound } from "next/navigation";
import DetailPage from "@/components/sections/triple-h/DetailPage";
import { getContentCollection, getContentItem } from "@/lib/content-items";
import { createContentMetadata } from "@/lib/metadata";

export async function generateStaticParams() { return (await getContentCollection("service")).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) { const { slug } = await params; return createContentMetadata(await getContentItem("service", slug)); }
export default async function ServicePage({ params }) { const { slug } = await params; const item = await getContentItem("service", slug); if (!item) notFound(); return <DetailPage item={item} kind="service" />; }
