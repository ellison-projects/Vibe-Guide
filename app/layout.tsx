import type { Metadata } from "next";
import "./globals.css";

import { PersonProvider } from "@/components/person/PersonProvider";

export const metadata: Metadata = {
  title: "Design Vocabulary Coach",
  description:
    "Mobile-first vocabulary coach for describing design, UX, structure, and content work to AI collaborators.",
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
