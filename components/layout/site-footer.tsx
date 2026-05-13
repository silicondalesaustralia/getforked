import Link from "next/link";

const socialLinks = [
  { label: "TikTok", href: "https://example.com", icon: "TT" },
  { label: "Instagram", href: "https://example.com", icon: "IG" },
  { label: "YouTube", href: "https://example.com", icon: "YT" },
  { label: "X", href: "https://example.com", icon: "X" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border py-10 text-sm text-zinc-400">
      <div className="container flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-zinc-200">We match businesses with AI-native developers who replace SaaS subscriptions with custom tools you own.</p>
          <p className="mt-1 text-zinc-400">© 2026 GetForked. Stop renting. Start owning.</p>
          <div className="mt-3 flex gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-zinc-200 transition hover:border-zinc-500"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 text-zinc-300">
          <Link href="/about" className="transition hover:text-white">
            About
          </Link>
          <Link href="/how-it-works" className="transition hover:text-white">
            How It Works
          </Link>
          <Link href="/for-businesses" className="transition hover:text-white">
            Businesses
          </Link>
          <Link href="/for-builders" className="transition hover:text-white">
            Builders
          </Link>
          <Link href="/support" className="transition hover:text-white">
            Support
          </Link>
          <Link href="/contact" className="transition hover:text-white">
            Contact
          </Link>
          <Link href="/sitemap" className="transition hover:text-white">
            Sitemap
          </Link>
          <Link href="/privacy" className="transition hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
