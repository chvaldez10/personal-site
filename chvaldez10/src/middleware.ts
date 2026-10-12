// Next's development server discovers this entry beside src/app.
// Preserve the existing root implementation as a shared module.
export { middleware } from "../middleware";

// Next requires matcher configuration to be a statically analyzable literal.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|woff|woff2)$).*)",
  ],
};
