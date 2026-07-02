export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    /*
     * Match semua route KECUALI:
     * - api/auth (NextAuth handlers)
     * - _next/static, _next/image (asset Next.js)
     * - favicon, fonts, icons, manifest, gambar
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|fonts|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};