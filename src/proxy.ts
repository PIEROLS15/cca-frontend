import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/login";
const HOME_PATH = "/";
const CERTIFICATE_VERIFICATION_PATH = "/verificar-certificado";
const PUBLIC_PATHS = [HOME_PATH, LOGIN_PATH, CERTIFICATE_VERIFICATION_PATH];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return Date.now() >= payload.exp * 1000;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (token && !isTokenExpired(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - api (API routes)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
