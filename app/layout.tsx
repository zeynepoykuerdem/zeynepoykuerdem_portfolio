import type { Metadata } from "next";
import { Caveat, IBM_Plex_Mono, IBM_Plex_Sans, Unbounded } from "next/font/google";
import Nav from "./Nav";
import "./globals.css";

// Fonts from the prototype. Next.js serves them from the site itself, so no request goes to Google.
const plexSans = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-mono" });
const caveat = Caveat({ subsets: ["latin", "latin-ext"], weight: ["500"], variable: "--font-hand" });
const unbounded = Unbounded({ subsets: ["latin", "latin-ext"], weight: ["600"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Öykü Erdem",
  description:
    "AI and full-stack engineer. Explainable AI, edge devices, and the backends that tie them together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${caveat.variable} ${unbounded.variable}`}
    >
      <body>
        <header className="topbar">
          <div className="topbar-in">
            <div className="crumbs">
              <a className="owner" href="https://github.com/zeynepoykuerdem" target="_blank" rel="noopener noreferrer">
                zeynepoykuerdem
              </a>
              <span className="sep">/</span>
              <a className="repo-name" href="/">
                zeynepoykuerdem_portfolio
              </a>
              <span className="badge ok">Public</span>
            </div>
            <span className="badge">open to hybrid roles</span>
          </div>
          <Nav />
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
