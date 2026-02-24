import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/checkout/settings - Public endpoint for checkout to know which payment methods are enabled
export async function GET() {
  try {
    const codSetting = await prisma.siteSetting.findUnique({
      where: { key: "cod_enabled" },
    });

    return NextResponse.json({
      codEnabled: codSetting?.value === "true",
      razorpayEnabled: true,
    });
  } catch (error) {
    console.error("Failed to fetch checkout settings:", error);
    return NextResponse.json(
      { codEnabled: false, razorpayEnabled: true },
      { status: 200 }
    );
  }
}
