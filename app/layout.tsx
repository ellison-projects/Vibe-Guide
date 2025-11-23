import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-slate-950 font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
