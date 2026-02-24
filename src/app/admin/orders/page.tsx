"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/types/product";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  trackingNumber: string | null;
  courierName: string | null;
  adminNote: string | null;
  paymentStatus: string;
  createdAt: string;
  user: { name: string; email: string; phone: string };
  address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: {
    id: string;
    quantity: number;
    size: number | null;
    price: number;
    product: { name: string; images: string[] };
  }[];
}

const statusOptions = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
    confirmed: "bg-blue-500/10 border-blue-500/30 text-blue-500",
    shipped: "bg-purple-500/10 border-purple-500/30 text-purple-500",
    delivered: "bg-green-500/10 border-green-500/30 text-green-500",
    cancelled: "bg-red-500/10 border-red-500/30 text-red-500",
  };
  return colors[status] || "bg-white/10 border-white/10 text-white";
};

export default function AdminOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrder = async (
    orderId: string,
    data: Record<string, string | null>
  ) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      addToast("Order updated!", "success");
      fetchOrders();
    } catch {
      addToast("Update failed", "error");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-white/5 rounded animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider mb-6">
        Orders ({orders.length})
      </h1>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
        >
          <option value="" className="bg-[#111]">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s} className="bg-[#111]">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Order Header Row */}
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === order.id ? null : order.id)
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-neutral-500 font-mono">
                      #{order.id.slice(0, 8)}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-white mt-0.5 truncate">
                    {order.user.name}
                    <span className="text-neutral-500 ml-2 text-xs">
                      {order.user.phone}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-500">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500 hidden sm:inline">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    })}
                  </span>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-amber-500 hover:text-amber-400 hidden sm:inline"
                  >
                    Detail
                  </Link>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      expandedId === order.id ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === order.id && (
                <div className="border-t border-white/10 p-4 sm:p-6 space-y-5">
                  {/* Customer + Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                        Customer
                      </h4>
                      <p className="text-sm text-white">{order.user.name}</p>
                      <p className="text-xs text-neutral-400">{order.user.email}</p>
                      <p className="text-xs text-neutral-400">{order.user.phone}</p>
                    </div>
                    {order.address && (
                      <div>
                        <h4 className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                          Address
                        </h4>
                        <p className="text-sm text-white">{order.address.fullName}</p>
                        <p className="text-xs text-neutral-400">
                          {order.address.addressLine1}
                          {order.address.addressLine2 &&
                            `, ${order.address.addressLine2}`}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {order.address.city}, {order.address.state} -{" "}
                          {order.address.pincode}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                      Items
                    </h4>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between py-1.5 border-b border-white/5 last:border-0"
                      >
                        <div>
                          <p className="text-sm text-white">{item.product.name}</p>
                          <p className="text-[10px] text-neutral-500">
                            UK {item.size || "-"} &times; {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/10">
                    {/* Status */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Status
                      </label>
                      <select
                        defaultValue={order.status}
                        onChange={(e) =>
                          updateOrder(order.id, { status: e.target.value })
                        }
                        disabled={updating === order.id}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#111]">
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tracking */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Tracking Number
                      </label>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const val = fd.get("tracking") as string;
                          if (val) updateOrder(order.id, { trackingNumber: val });
                        }}
                        className="flex gap-1"
                      >
                        <input
                          type="text"
                          name="tracking"
                          defaultValue={order.trackingNumber || ""}
                          placeholder="Tracking #"
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50"
                        />
                        <button
                          type="submit"
                          disabled={updating === order.id}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg disabled:opacity-50"
                        >
                          Set
                        </button>
                      </form>
                    </div>

                    {/* Courier Name */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Courier
                      </label>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const val = fd.get("courier") as string;
                          updateOrder(order.id, { courierName: val || null });
                        }}
                        className="flex gap-1"
                      >
                        <input
                          type="text"
                          name="courier"
                          defaultValue={order.courierName || ""}
                          placeholder="e.g. Delhivery"
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50"
                        />
                        <button
                          type="submit"
                          disabled={updating === order.id}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg disabled:opacity-50"
                        >
                          Set
                        </button>
                      </form>
                    </div>

                    {/* Admin Note */}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Admin Note
                      </label>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const val = fd.get("note") as string;
                          updateOrder(order.id, { adminNote: val || null });
                        }}
                        className="flex gap-1"
                      >
                        <input
                          type="text"
                          name="note"
                          defaultValue={order.adminNote || ""}
                          placeholder="Internal note..."
                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50"
                        />
                        <button
                          type="submit"
                          disabled={updating === order.id}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg disabled:opacity-50"
                        >
                          Set
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Link to detail page on mobile */}
                  <div className="sm:hidden pt-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="block text-center py-2 bg-white/5 border border-white/10 rounded-lg text-amber-500 text-sm hover:bg-white/10 transition-colors"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
