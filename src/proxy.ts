import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROOTS = ["/", "/membresia", "/terminos", "/privacidad", "/cookies", "/contacto"];
const AUTH_ROUTES = ["/login", "/registro", "/recuperar", "/restablecer", "/verificar"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Static / API are matched out by config below; defensive check kept tight.
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );
  const isMember = pathname === "/app" || pathname.startsWith("/app/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  // Already-signed-in users should not see auth pages.
  if (session && isAuthRoute) {
    return NextResponse.redirect(
      new URL(session.user.role === "admin" ? "/admin" : "/app", req.nextUrl),
    );
  }

  // Member area requires a session (subscription gate enforced server-side later).
  if (isMember && !session) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Admin requires admin role.
  if (isAdmin) {
    if (!session) {
      const url = new URL("/login", req.nextUrl);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/app", req.nextUrl));
    }
  }

  // Allow everything else (PUBLIC_ROOTS too).
  void PUBLIC_ROOTS;
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on everything except static files and next internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?)$).*)",
  ],
};
