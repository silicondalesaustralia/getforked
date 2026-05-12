import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-businesses", label: "Businesses" },
  { href: "/for-builders", label: "Builders" },
  { href: "/approved-builders", label: "Approved Builders" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-18 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo-dark.svg" alt="getforked.dev" width={210} height={42} priority />
        </Link>
        <nav className="hidden gap-5 text-sm text-zinc-300 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/brief/new"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-zinc-950 shadow-[0_10px_30px_-12px_var(--color-accent)] transition hover:opacity-95"
        >
          Submit Brief
        </Link>
      </div>
    </header>
  );
}
