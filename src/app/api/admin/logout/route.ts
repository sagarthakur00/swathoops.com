import { NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/config";

// POST /api/admin/logout
export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_CONFIG.cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
