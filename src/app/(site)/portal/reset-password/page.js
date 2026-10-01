import { Suspense } from "react";
import { notFound } from "next/navigation";
import ResetPassword from "@/components/portal/ResetPassword";
import { getEditablePage, getEditablePageMetadata } from "@/lib/page-content";
import { CUSTOMER_PORTAL_ENABLED } from "@/lib/features";
export async function generateMetadata() { return CUSTOMER_PORTAL_ENABLED ? getEditablePageMetadata("portal-reset-password") : {}; }
export default async function ResetPasswordPage() { if (!CUSTOMER_PORTAL_ENABLED) notFound(); const page = await getEditablePage("portal-reset-password"); return <main className="portal-page" id="main-content"><div className="container"><Suspense fallback={null}><ResetPassword managedCopy={page.content.reset} /></Suspense></div></main>; }
