import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "SWATHOOPS";
const appDescription =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Premium Men's Footwear";

export const metadata: Metadata = {
  title: `${appName} | ${appDescription}`,
  description: `Handcrafted premium men's footwear. Discover our collection of loafers, formal shoes, and casual footwear crafted with the finest materials.`,
  keywords: [
    "men's shoes",
    "premium footwear",
    "leather shoes",
    "loafers",
    "formal shoes",
    "casual shoes",
    "handcrafted shoes",
  ],
  openGraph: {
    title: `${appName} | ${appDescription}`,
    description:
      "Handcrafted premium men's footwear for the modern gentleman.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0a0a] text-white antialiased font-sans">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
