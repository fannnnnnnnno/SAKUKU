import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Melindungi seluruh route kecuali asset statis, manifest, dan icon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons/).*)"],
};
