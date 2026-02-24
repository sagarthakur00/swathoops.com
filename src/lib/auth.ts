import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/config";

interface AdminPayload {
  id: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_CONFIG.bcryptSaltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: AdminPayload): string {
  const options: SignOptions = {
    expiresIn: AUTH_CONFIG.jwtExpiry as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, AUTH_CONFIG.jwtSecret(), options);
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, AUTH_CONFIG.jwtSecret()) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromCookie(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function isAuthenticated(): Promise<boolean> {
  const admin = await getAdminFromCookie();
  return admin !== null;
}
