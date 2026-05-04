import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { authOptions } from "@/lib/auth/config";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/contact");
  }

  return <AdminShell>{children}</AdminShell>;
}
