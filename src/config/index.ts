// =============================================================================
// Server-side configuration — loaded from environment variables
// =============================================================================

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

// --- Authentication ---
export const AUTH_CONFIG = {
  jwtSecret: () => requireEnv("JWT_SECRET"),
  jwtExpiry: optionalEnv("JWT_EXPIRY", "7d") as "7d" | "24h" | "30d" | string,
  bcryptSaltRounds: parseInt(optionalEnv("BCRYPT_SALT_ROUNDS", "12"), 10),
  cookieName: "admin_token",
  cookieMaxAge: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

// --- Razorpay ---
export const RAZORPAY_CONFIG = {
  keyId: () => requireEnv("RAZORPAY_KEY_ID"),
  keySecret: () => requireEnv("RAZORPAY_KEY_SECRET"),
  currency: optionalEnv("NEXT_PUBLIC_CURRENCY", "INR"),
} as const;

// --- Upload ---
export const UPLOAD_CONFIG = {
  maxSize: parseInt(optionalEnv("MAX_UPLOAD_SIZE", "5242880"), 10), // 5MB
  allowedTypes: optionalEnv(
    "ALLOWED_UPLOAD_TYPES",
    "image/jpeg,image/png,image/webp"
  ).split(","),
  uploadDir: "public/uploads",
  publicPath: "/uploads",
} as const;

// --- Admin Seed ---
export const SEED_CONFIG = {
  adminEmail: () => optionalEnv("ADMIN_EMAIL", "admin@swathoops.com"),
  adminPassword: () => optionalEnv("ADMIN_PASSWORD", "admin123"),
} as const;

// --- Defaults ---
export const DEFAULTS = {
  country: optionalEnv("NEXT_PUBLIC_DEFAULT_COUNTRY", "India"),
  defaultSizes: [6, 7, 8, 9, 10, 11],
  toastDuration: 4000,
  localStorageCartKey: "swathoops_cart",
} as const;
