import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";

// GET /api/products/:id - Return single product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try finding by slug first, then by id
    let product = await prisma.product.findUnique({
      where: { slug: id },
      include: { variants: { orderBy: { size: "asc" } } },
    });
    if (!product) {
      product = await prisma.product.findUnique({
        where: { id },
        include: { variants: { orderBy: { size: "asc" } } },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      "name",
      "price",
      "discountPrice",
      "description",
      "longDescription",
      "material",
      "sole",
      "quality",
      "stock",
      "isOutOfStock",
      "isActive",
      "isFeatured",
      "isOnSale",
      "images",
      "color",
      "colorCode",
      "category",
      "sizes",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle variants update
    if (body.variants && Array.isArray(body.variants)) {
      // Delete existing variants and recreate
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      
      const variantData = body.variants.map(
        (v: { size: number; stock: number }) => ({
          productId: id,
          size: v.size,
          stock: v.stock,
          isOutOfStock: v.stock <= 0,
        })
      );
      
      await prisma.productVariant.createMany({ data: variantData });

      // Recalculate total stock from variants
      const totalStock = body.variants.reduce(
        (sum: number, v: { stock: number }) => sum + v.stock,
        0
      );
      updateData.stock = totalStock;
      updateData.isOutOfStock = totalStock <= 0;
      updateData.sizes = body.variants.map((v: { size: number }) => v.size);
    }

    // Auto-set isOutOfStock based on stock
    if (updateData.stock !== undefined && (updateData.stock as number) <= 0) {
      updateData.isOutOfStock = true;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { variants: { orderBy: { size: "asc" } } },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
