import { Suspense } from "react";
import ResetPassword from "@/components/portal/ResetPassword";
import { getEditablePage, getEditablePageMetadata } from "@/lib/page-content";
export async function generateMetadata() { return getEditablePageMetadata("portal-reset-password"); }
export default async function ResetPasswordPage() { const page = await getEditablePage("portal-reset-password"); return <main className="portal-page" id="main-content"><div className="container"><Suspense fallback={null}><ResetPassword managedCopy={page.content.reset} /></Suspense></div></main>; }
