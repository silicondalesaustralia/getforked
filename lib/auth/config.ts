import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env";
import { resolveRole } from "@/lib/auth/roles";

export const authOptions: NextAuthOptions = {
  secret: env.nextAuthSecret,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password || password !== env.nextAuthSecret) {
          return null;
        }

        return { id: email, email, role: resolveRole(email) };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role ?? resolveRole(session.user.email ?? "");
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
