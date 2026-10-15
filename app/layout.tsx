import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Öykü Erdem",
  description:
    "AI and full-stack engineer. Explainable AI, edge devices, and the backends that tie them together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            oykue
          </Link>
          <nav className="tabs" aria-label="Pages">
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/cloud">Cloud notes</Link>
            <Link href="/nextex-mcp">NexTex MCP</Link>
            <Link href="/now">Now</Link>
            <Link href="/developers">For developers</Link>
          </nav>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
