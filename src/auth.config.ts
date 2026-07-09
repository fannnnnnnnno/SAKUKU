import type { NextAuthConfig } from "next-auth";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authConfig = {
  secret: authSecret,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ];

      const protectedPrefixes = [
        "/dashboard",
        "/transaksi",
        "/scan",
        "/laporan",
        "/kategori",
        "/pengaturan",
        "/tambah",
      ];

      const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
      const isProtectedRoute = protectedPrefixes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
      const isApiAuthRoute = pathname.startsWith("/api/auth");
      const isApiRoute = pathname.startsWith("/api/");

      if (isApiAuthRoute) return true;

      if (isPublicRoute) {
        if (isLoggedIn && pathname === "/") {
          return Response.redirect(new URL("/transaksi", nextUrl));
        }
        if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isProtectedRoute) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/login", nextUrl.origin);
          loginUrl.searchParams.set("callbackUrl", nextUrl.href);
          return Response.redirect(loginUrl);
        }
        return true;
      }

      if (isApiRoute && !isLoggedIn) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
