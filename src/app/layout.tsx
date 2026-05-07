import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temple Finance Tracker",
  description: "Secure and modern finance tracking for our temple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="container animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
