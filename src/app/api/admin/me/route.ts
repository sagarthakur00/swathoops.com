import { NextResponse } from "next/server";
import { getAdminFromCookie } from "@/lib/auth";

// GET /api/admin/me - Check admin auth status
export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Auth check failed:", error);
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }
}
