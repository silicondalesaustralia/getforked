import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { authOptions } from "@/lib/auth/config";
import { hasRole } from "@/lib/auth/roles";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !hasRole(session.user.role, "admin")) {
    redirect("/login?callbackUrl=/admin");
  }

  return <AdminShell>{children}</AdminShell>;
}
