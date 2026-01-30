import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather SP - Is It Raining in São Paulo?",
  description: "Check if it's raining in São Paulo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
