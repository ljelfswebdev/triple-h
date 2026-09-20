import { NextResponse } from "next/server";
import { getAdminPath } from "@/lib/admin-path";

export function proxy(req) {
  const admin = getAdminPath();
  const pathname = req.nextUrl.pathname;

  if (pathname === `/${admin}` || pathname.startsWith(`/${admin}/`)) {
    const url = req.nextUrl.clone();
    url.pathname = `/cms-internal${pathname.slice(admin.length + 1)}` || "/cms-internal";
    return NextResponse.rewrite(url);
  }

  if (pathname === "/cms-internal" || pathname.startsWith("/cms-internal/")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
