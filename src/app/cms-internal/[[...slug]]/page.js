import AdminApp from "@/components/admin/AdminApp";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminPath } from "@/lib/admin-path";
import "@/styles/admin.css";

export default async function Admin({ params }) {
  const { slug = [] } = await params;
  const loginRoute = slug[0] === "login";
  const session = await getSession();

  if (!session && !loginRoute) {
    const adminPath = getAdminPath();
    redirect(`/${adminPath}/login`);
  }

  if (session && loginRoute) {
    const adminPath = getAdminPath();
    redirect(`/${adminPath}`);
  }

  return (
    <AdminApp
      initialSession={
        session ? { id: session.sub, email: session.email, role: session.role } : null
      }
      route={slug}
    />
  );
}
