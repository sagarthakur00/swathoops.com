import { NextRequest, NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { DEFAULTS, RAZORPAY_CONFIG } from "@/config";

// POST /api/razorpay/create-order
// Creates a Razorpay order + a pending DB order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, address, items } = body;

    // ---------- Validate ----------
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Customer name, email, and phone are required" },
        { status: 400 }
      );
    }

    if (
      !address?.addressLine1 ||
      !address?.city ||
      !address?.state ||
      !address?.pincode
    ) {
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

    // ---------- Sanitize ----------
    const sanitizedEmail = customer.email.trim().toLowerCase();
    const sanitizedPhone = customer.phone.trim();
    const sanitizedName = customer.name.trim();

    // ---------- Find or create user ----------
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

    // ---------- Create address ----------
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

    // ---------- Calculate total ----------
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
          { error: `Product not found` },
          { status: 400 }
        );
      }

      if (product.isOutOfStock || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} is out of stock or insufficient stock` },
          { status: 400 }
        );
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        size: item.size || null,
        price: product.price,
      });
    }

    // ---------- Create Razorpay order ----------
    // Razorpay expects amount in paise (INR × 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: RAZORPAY_CONFIG.currency,
      receipt: `order_${Date.now()}`,
      notes: {
        customerEmail: sanitizedEmail,
        customerName: sanitizedName,
      },
    });

    // ---------- Create pending DB order ----------
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: newAddress.id,
        totalAmount,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "razorpay",
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
