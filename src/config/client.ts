// =============================================================================
// Client-side configuration — only uses NEXT_PUBLIC_ env vars
// =============================================================================

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "SWATHOOPS",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Premium Men's Footwear",
  fullTitle: `${process.env.NEXT_PUBLIC_APP_NAME || "SWATHOOPS"} | ${
    process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Premium Men's Footwear"
  }`,
} as const;

export const CONTACT_CONFIG = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@swathoops.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 8287524434",
  address:
    process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "Mumbai, Maharashtra, India",
} as const;

export const PAYMENT_CONFIG = {
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "INR",
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹",
  razorpayScriptUrl: "https://checkout.razorpay.com/v1/checkout.js",
} as const;

export const THEME = {
  brandColor: "#f59e0b", // amber-500
  backgroundColor: "#0a0a0a",
} as const;

// Product categories available in admin
export const PRODUCT_CATEGORIES = [
  "Casual",
  "Formal",
  "Sports",
  "Boots",
  "Sandals",
  "Loafers",
] as const;

// Available shoe sizes
export const AVAILABLE_SIZES = [6, 7, 8, 9, 10, 11, 12] as const;

// Cart localStorage key
export const CART_STORAGE_KEY = "swathoops_cart";

// Toast auto-dismiss duration
export const TOAST_DURATION = 4000;

// Footer navigation
export const FOOTER_LINKS = {
  quickLinks: [
    { href: "/shop", label: "Shop All" },
    { href: "/shop?category=Loafers", label: "Loafers" },
    { href: "/shop?category=Casual", label: "Casual" },
    { href: "/shop?category=Formal", label: "Formal" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "#", label: "Shipping Policy" },
    { href: "#", label: "Returns" },
  ],
  social: ["Instagram", "Twitter", "Facebook"],
} as const;

// Navbar navigation
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
