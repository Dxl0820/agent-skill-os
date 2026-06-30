import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Skill OS",
  description: "Install battle-tested skills into your AI coding agent in 30 seconds."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
