import Link from "next/link";

const adminItems = [
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/industries", label: "Industries" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/analytics", label: "Analytics" },
];

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container py-8">
        <h1 className="text-2xl font-bold">GetForked Admin</h1>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          {adminItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md border border-zinc-800 px-3 py-2 text-zinc-300 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
