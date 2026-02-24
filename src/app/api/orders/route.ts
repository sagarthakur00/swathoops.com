import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { DEFAULTS } from "@/config";

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, address, items } = body;

    // Validate input
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Customer name, email, and phone are required" },
        { status: 400 }
      );
    }

    if (!address?.addressLine1 || !address?.city || !address?.state || !address?.pincode) {
      return NextResponse.json(
        { error: "Complete address is required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = customer.email.trim().toLowerCase();
    const sanitizedPhone = customer.phone.trim();
    const sanitizedName = customer.name.trim();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone,
        },
      });
    }

    // Create address
    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: address.fullName || sanitizedName,
        phone: address.phone || sanitizedPhone,
        addressLine1: address.addressLine1.trim(),
        addressLine2: address.addressLine2?.trim() || null,
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        country: address.country || DEFAULTS.country,
      },
    });

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      size: number | null;
      price: number;
    }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.isOutOfStock || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} is out of stock or insufficient stock` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        size: item.size || null,
        price: product.price,
      });
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: newAddress.id,
        totalAmount,
        status: "pending",
        paymentStatus: "pending",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        user: true,
      },
    });

    // Reduce stock for each item
    for (const item of orderItems) {
      const product = await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      // If stock reaches 0, mark as out of stock
      if (product.stock <= 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { isOutOfStock: true },
        });
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// GET /api/orders - Return all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch addresses for each order
    const ordersWithAddress = await Promise.all(
      orders.map(async (order) => {
        let address = null;
        if (order.addressId) {
          address = await prisma.address.findUnique({
            where: { id: order.addressId },
          });
        }
        return { ...order, address };
      })
    );

    return NextResponse.json(ordersWithAddress);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
