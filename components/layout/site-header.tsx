import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-900/80 bg-zinc-950/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo-dark.svg" alt="getforked.dev" width={210} height={42} priority />
        </Link>
        <nav className="hidden gap-4 text-sm text-zinc-300 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/book"
          className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-zinc-950"
        >
          Get Forked
        </Link>
      </div>
    </header>
  );
}
