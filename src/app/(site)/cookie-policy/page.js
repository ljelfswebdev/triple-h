import LegalPage from "@/components/sections/shared/LegalPage";
import { getEditablePage, getEditablePageMetadata } from "@/lib/page-content";

const slug = "cookie-policy";

export async function generateMetadata() {
  return getEditablePageMetadata(slug);
}

export default async function CookiePolicyPage() {
  const page = await getEditablePage(slug);
  return <LegalPage page={page} />;
}
