import type { Session } from "next-auth";

export type PlatformRole = "buyer" | "builder" | "admin" | "super_admin";

const roleRank: Record<PlatformRole, number> = {
  buyer: 1,
  builder: 1,
  admin: 2,
  super_admin: 3,
};

function listFromEnv(key: string) {
  return (process.env[key] ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveRole(email: string): PlatformRole {
  const normalized = email.toLowerCase();
  if (listFromEnv("SUPER_ADMIN_EMAILS").includes(normalized)) {
    return "super_admin";
  }
  if (listFromEnv("ADMIN_EMAILS").includes(normalized)) {
    return "admin";
  }
  if (listFromEnv("BUILDER_EMAILS").includes(normalized)) {
    return "builder";
  }
  return "buyer";
}

export function hasRole(role: PlatformRole | undefined, minimum: PlatformRole) {
  return role ? roleRank[role] >= roleRank[minimum] : false;
}

export function requireRole(session: Session | null, minimum: PlatformRole) {
  if (!hasRole(session?.user.role, minimum)) {
    throw new Error("You do not have permission to access this resource.");
  }
}
