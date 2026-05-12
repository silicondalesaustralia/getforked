import type { DefaultSession } from "next-auth";
import type { PlatformRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: PlatformRole;
    };
  }

  interface User {
    role: PlatformRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: PlatformRole;
  }
}
