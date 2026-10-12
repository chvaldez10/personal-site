import {
  convexAuthNextjsMiddleware,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { api } from "./convex/_generated/api";
function protectedRoute(path: string) {
  return ["/dashboard", "/admin"].some(
    (base) => path === base || path.startsWith(base + "/"),
  );
}
const authenticate = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (!protectedRoute(request.nextUrl.pathname)) return;
    const token = await convexAuth.getToken();
    if (!token) return nextjsMiddlewareRedirect(request, "/login");
    const owner = await fetchQuery(api.admin.current, {}, { token });
    if (!owner) return nextjsMiddlewareRedirect(request, "/login");
  },
  { shouldHandleCode: false },
);
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  try {
    return await authenticate(request, event);
  } catch {
    if (protectedRoute(request.nextUrl.pathname))
      return NextResponse.redirect(new URL("/login", request.url));
    if (request.nextUrl.pathname.startsWith("/api/auth"))
      return NextResponse.json(
        { error: "Authentication is temporarily unavailable." },
        { status: 503 },
      );
    return NextResponse.next();
  }
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|woff|woff2)$).*)",
  ],
};
