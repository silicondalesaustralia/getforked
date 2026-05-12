import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-businesses", label: "Businesses" },
  { href: "/for-builders", label: "Builders" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo-dark.svg" alt="getforked.dev" width={290} height={58} priority />
        </Link>
        <nav className="hidden gap-7 text-lg font-semibold text-zinc-300 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
          <div className="group relative">
            <Link href="/ai-automation/" className="transition hover:text-white">
              What We Build
            </Link>
            <div className="invisible absolute left-1/2 top-full w-[360px] -translate-x-1/2 pt-4 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl">
                <Link href="/ai-automation/" className="block rounded-xl p-3 transition hover:bg-surface">
                  <span className="block text-sm font-semibold text-zinc-100">AI Automation</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-400">
                    Custom AI workflows, agents, dashboards and internal automations.
                  </span>
                </Link>
                <Link href="/zapier/" className="block rounded-xl p-3 transition hover:bg-surface">
                  <span className="block text-sm font-semibold text-zinc-100">Zapier</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-400">
                    Replace Zapier workflows with approved automation builders.
                  </span>
                </Link>
                <Link href="/sitemap/" className="mt-3 block rounded-lg px-3 py-2 text-sm text-accent transition hover:bg-surface">
                  View all pages
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <Link
          href="/brief/new"
          className="rounded-full bg-accent px-6 py-3 text-lg font-semibold text-zinc-950 shadow-[0_10px_30px_-12px_var(--color-accent)] transition hover:opacity-95"
        >
          Submit Brief
        </Link>
      </div>
    </header>
  );
}
