import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skill OS",
  description: "Install battle-tested skills into your AI coding agent in 30 seconds."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a className="brand" href="/">Agent Skill OS</a>
          <nav>
            <a href="/skills">Skills</a>
            <a href="/packs">Packs</a>
            <a href="/docs">Docs</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
