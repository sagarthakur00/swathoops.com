import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { DEFAULTS } from "@/config";

// GET /api/products - Return all products (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const stockStatus = searchParams.get("stockStatus") || "";
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const featured = searchParams.get("featured") || "";

    const where: Record<string, unknown> = {};

    if (activeOnly) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (stockStatus === "in-stock") {
      where.isOutOfStock = false;
    } else if (stockStatus === "out-of-stock") {
      where.isOutOfStock = true;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: { variants: { orderBy: { size: "asc" } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      sku,
      price,
      discountPrice,
      description,
      longDescription,
      material,
      sole,
      quality,
      color,
      colorCode,
      category,
      images,
      isActive,
      isFeatured,
      isOnSale,
      variants,
    } = body;

    if (!name || !sku || !price || !description || !material) {
      return NextResponse.json(
        { error: "Name, SKU, price, description, and material are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check uniqueness
    const existing = await prisma.product.findFirst({
      where: { OR: [{ slug }, { sku }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Product with this name or SKU already exists" },
        { status: 400 }
      );
    }

    // Build variants data
    const variantData = Array.isArray(variants)
      ? variants.map((v: { size: number; stock: number }) => ({
          size: v.size,
          stock: v.stock,
          isOutOfStock: v.stock <= 0,
        }))
      : [];

    // Calculate total stock
    const totalStock = variantData.reduce(
      (sum: number, v: { stock: number }) => sum + v.stock,
      0
    );
    const sizes = variantData.map((v: { size: number }) => v.size);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        price,
        discountPrice: discountPrice || null,
        description,
        longDescription: longDescription || null,
        material,
        sole: sole || null,
        quality: quality || null,
        color: color || null,
        colorCode: colorCode || null,
        category: category || null,
        sizes: sizes.length > 0 ? sizes : [...DEFAULTS.defaultSizes],
        stock: totalStock,
        isOutOfStock: totalStock <= 0,
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        isOnSale: isOnSale === true,
        images: images || [],
        variants: {
          create: variantData,
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
