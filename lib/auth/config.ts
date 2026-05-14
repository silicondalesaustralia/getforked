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

        if (!email || !password || !validPasswordForEmail(email, password)) {
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

function validPasswordForEmail(email: string, password: string) {
  const userPassword = authUserCredentials().get(email);
  if (userPassword) return password === userPassword;
  return password === env.nextAuthSecret;
}

function authUserCredentials() {
  return new Map(
    (process.env.AUTH_USER_CREDENTIALS ?? "")
      .split(",")
      .map((pair) => {
        const separator = pair.indexOf(":");
        if (separator < 1) return null;
        const email = pair.slice(0, separator).trim().toLowerCase();
        const password = pair.slice(separator + 1);
        return email && password ? [email, password] as const : null;
      })
      .filter((entry): entry is readonly [string, string] => Boolean(entry)),
  );
}
