"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/cloud", label: "Cloud notes" },
  { href: "/nextex-mcp", label: "NexTex MCP" },
  { href: "/now", label: "Now" },
  { href: "/developers", label: "For developers" },
];

// Pill tabs; the current page gets aria-current so CSS can highlight it.
export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="tabs" aria-label="Pages">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
