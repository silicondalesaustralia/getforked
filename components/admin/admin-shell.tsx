import Link from "next/link";

const adminItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/briefs/demo", label: "Briefs" },
  { href: "/admin/applications/demo", label: "Applications" },
  { href: "/admin/matching/demo", label: "Matching" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/programmatic", label: "Programmatic" },
  { href: "/admin/settings", label: "Settings" },
];

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight">GetForked Marketplace Admin</h1>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          {adminItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-border bg-card px-4 py-2 text-zinc-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
