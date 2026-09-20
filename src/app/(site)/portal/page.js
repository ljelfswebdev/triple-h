import PortalApp from "@/components/portal/PortalApp";
import { getAnySession } from "@/lib/auth";
import { getEditablePage, getEditablePageMetadata } from "@/lib/page-content";
export async function generateMetadata() { return getEditablePageMetadata("portal"); }
export default async function PortalPage() { const [session, page] = await Promise.all([getAnySession(["employee", "customer"]), getEditablePage("portal")]); const copy = { ...page.content.portal.auth, ...page.content.portal.dashboard, ...page.content.portal.security }; return <main className="portal-page" id="main-content" tabIndex={-1}><div className="container"><PortalApp initialUser={session} managedCopy={copy} /></div></main>; }
