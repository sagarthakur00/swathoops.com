"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/types/product";
import Image from "next/image";

interface TopProduct {
  productId: string;
  name: string;
  image: string;
  totalSold: number;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  topSelling: TopProduct[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: "💰",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Monthly Revenue",
      value: formatPrice(stats.monthlyRevenue),
      icon: "📈",
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: "📦",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: "👥",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Products",
      value: stats.totalProducts.toString(),
      icon: "👟",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Pending",
      value: stats.pendingOrders.toString(),
      icon: "⏳",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      label: "Shipped",
      value: stats.shippedOrders.toString(),
      icon: "🚚",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Delivered",
      value: stats.deliveredOrders.toString(),
      icon: "✅",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider mb-6">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${card.bg} border rounded-xl p-4 sm:p-5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{card.icon}</span>
              <p className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider truncate">
                {card.label}
              </p>
            </div>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Top Selling Products
          </h2>
          {stats.topSelling.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topSelling.map((item, i) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 w-5">{i + 1}.</span>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.name}</p>
                  </div>
                  <span className="text-sm font-medium text-amber-500">
                    {item.totalSold} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Order Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Order Status Breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: "Pending", count: stats.pendingOrders, color: "bg-yellow-500" },
              { label: "Confirmed", count: stats.confirmedOrders, color: "bg-blue-500" },
              { label: "Shipped", count: stats.shippedOrders, color: "bg-purple-500" },
              { label: "Delivered", count: stats.deliveredOrders, color: "bg-green-500" },
              { label: "Cancelled", count: stats.cancelledOrders, color: "bg-red-500" },
            ].map((item) => {
              const pct =
                stats.totalOrders > 0
                  ? (item.count / stats.totalOrders) * 100
                  : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-400">{item.label}</span>
                    <span className="text-white font-medium">{item.count}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
