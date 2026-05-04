import Link from "next/link";

const socialLinks = [
  { label: "TikTok", href: "https://example.com", icon: "TT" },
  { label: "Instagram", href: "https://example.com", icon: "IG" },
  { label: "YouTube", href: "https://example.com", icon: "YT" },
  { label: "X", href: "https://example.com", icon: "X" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-zinc-900 py-8 text-sm text-zinc-400">
      <div className="container flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p>Own Your Code. We Build It, You Own It.</p>
          <p>Remote-first, serving businesses across major English-speaking markets.</p>
          <div className="mt-3 flex gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-xs font-semibold text-zinc-200 hover:border-zinc-500"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
        <nav className="flex gap-4">
          <Link href="/privacy-policy" className="hover:text-zinc-200">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-200">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
