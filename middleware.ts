import { withAuth } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/buyer/:path*", "/builder/:path*"],
};

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const role = token?.role;
      if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/api/admin")) {
        return role === "admin" || role === "super_admin";
      }
      return Boolean(token);
    },
  },
  pages: {
    signIn: "/login",
  },
});
