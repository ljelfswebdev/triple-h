import { notFound } from "next/navigation";
import PortalApp from "@/components/portal/PortalApp";
import { getAnySession } from "@/lib/auth";
import { getEditablePage, getEditablePageMetadata } from "@/lib/page-content";
import { CUSTOMER_PORTAL_ENABLED } from "@/lib/features";
export async function generateMetadata() { return CUSTOMER_PORTAL_ENABLED ? getEditablePageMetadata("portal") : {}; }
export default async function PortalPage() { if (!CUSTOMER_PORTAL_ENABLED) notFound(); const [session, page] = await Promise.all([getAnySession(["employee", "customer"]), getEditablePage("portal")]); const copy = { ...page.content.portal.auth, ...page.content.portal.dashboard, ...page.content.portal.security }; return <main className="portal-page" id="main-content" tabIndex={-1}><div className="container"><PortalApp initialUser={session} managedCopy={copy} /></div></main>; }
