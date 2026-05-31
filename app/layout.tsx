import type { Metadata } from "next";
import "./globals.css";

import { PersonProvider } from "@/components/person/PersonProvider";

export const metadata: Metadata = {
  title: "Vibe Guide",
  description:
    "A plain-English guide for founders and makers building real products with AI—no engineering background required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        <PersonProvider>{children}</PersonProvider>
      </body>
    </html>
  );
}
