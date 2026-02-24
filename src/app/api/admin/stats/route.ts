import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";

// GET /api/admin/stats - Dashboard stats
export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      monthlyRevenueResult,
      totalCustomers,
      topSellingItems,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.count({ where: { status: "confirmed" } }),
      prisma.order.count({ where: { status: "shipped" } }),
      prisma.order.count({ where: { status: "delivered" } }),
      prisma.order.count({ where: { status: "cancelled" } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: firstOfMonth } },
      }),
      prisma.user.count(),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    // Get product names for top selling
    const topProductIds = topSellingItems.map((item) => item.productId);
    const topProducts = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, images: true },
    });

    const topSelling = topSellingItems.map((item) => {
      const product = topProducts.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name || "Unknown",
        image: product?.images?.[0] || "",
        totalSold: item._sum.quantity || 0,
      };
    });

    return NextResponse.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: revenueResult._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenueResult._sum.totalAmount || 0,
      totalCustomers,
      topSelling,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
