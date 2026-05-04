import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  secret: env.nextAuthSecret,
  pages: {
    signIn: "/contact",
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

        if (!adminEmails.includes(email)) {
          return null;
        }

        return { id: email, email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
};
