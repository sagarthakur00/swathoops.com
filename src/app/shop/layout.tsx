import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All | SWATHOOPS",
  description:
    "Browse our complete collection of premium men's footwear. Loafers, formal shoes, and casual styles handcrafted with the finest materials.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
