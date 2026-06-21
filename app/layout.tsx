import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StayEasy — Find your perfect stay",
  description: "Book unique homes, apartments and experiences around the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
