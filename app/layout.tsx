import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulse",
  description: "Internal task tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", "h-full", "antialiased", inter.variable)}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground font-sans min-h-full flex flex-col text-[15px]">
        {children}
      </body>
    </html>
  );
}
