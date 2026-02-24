"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatPrice } from "@/types/product";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  trackingNumber: string | null;
  courierName: string | null;
  adminNote: string | null;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
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
    product: { name: string; images: string[]; sku: string };
  }[];
}

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

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

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setOrder)
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, [orderId]);

  const updateOrder = async (data: Record<string, string | null>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setOrder(updated);
      addToast("Order updated!", "success");
    } catch {
      addToast("Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Order not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-amber-500 hover:text-amber-400 text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentStep = order.status === "cancelled" ? -1 : statusSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
            Order Detail
          </h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            #{order.id}
          </p>
        </div>
      </div>

      {/* Status Timeline */}
      {order.status !== "cancelled" ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 mb-4">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                      idx <= currentStep
                        ? "bg-amber-500 border-amber-500 text-black"
                        : "bg-transparent border-white/20 text-neutral-500"
                    }`}
                  >
                    {idx <= currentStep ? "✓" : idx + 1}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 capitalize hidden sm:block">
                    {step}
                  </span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      idx < currentStep ? "bg-amber-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
          <p className="text-red-400 text-sm font-medium text-center">
            This order has been cancelled
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Items + Customer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
            <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-4">
              Items ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.product.name}</p>
                    <p className="text-[10px] text-neutral-500">
                      {item.product.sku} &middot; UK {item.size || "-"} &times;{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-white flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 mt-4 border-t border-white/10">
              <span className="text-sm text-neutral-400">Total</span>
              <span className="text-lg font-bold text-amber-500">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Customer + Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
              <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-3">
                Customer
              </h2>
              <p className="text-sm text-white">{order.user.name}</p>
              <p className="text-xs text-neutral-400 mt-1">{order.user.email}</p>
              <p className="text-xs text-neutral-400">{order.user.phone}</p>
            </div>
            {order.address && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-3">
                  Shipping Address
                </h2>
                <p className="text-sm text-white">{order.address.fullName}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {order.address.addressLine1}
                  {order.address.addressLine2 &&
                    `, ${order.address.addressLine2}`}
                </p>
                <p className="text-xs text-neutral-400">
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                <p className="text-xs text-neutral-400">{order.address.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Controls */}
        <div className="space-y-4">
          {/* Status & Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Status</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Payment</span>
              <span className="text-xs text-white capitalize">
                {order.paymentMethod} - {order.paymentStatus}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Date</span>
              <span className="text-xs text-white">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Tracking</span>
                <span className="text-xs text-white font-mono">
                  {order.trackingNumber}
                </span>
              </div>
            )}
            {order.courierName && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Courier</span>
                <span className="text-xs text-white">{order.courierName}</span>
              </div>
            )}
            {order.adminNote && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs text-neutral-500">Admin Note</span>
                <p className="text-xs text-neutral-300 mt-1">{order.adminNote}</p>
              </div>
            )}
          </div>

          {/* Update Controls */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider">
              Update Order
            </h2>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">Status</label>
              <select
                defaultValue={order.status}
                onChange={(e) => updateOrder({ status: e.target.value })}
                disabled={updating}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#111]">
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                updateOrder({ trackingNumber: fd.get("tracking") as string });
              }}
            >
              <label className="block text-xs text-neutral-500 mb-1">
                Tracking Number
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  name="tracking"
                  defaultValue={order.trackingNumber || ""}
                  placeholder="Enter tracking #"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={updating}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </form>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                updateOrder({ courierName: (fd.get("courier") as string) || null });
              }}
            >
              <label className="block text-xs text-neutral-500 mb-1">Courier</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  name="courier"
                  defaultValue={order.courierName || ""}
                  placeholder="e.g. Delhivery"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={updating}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </form>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                updateOrder({ adminNote: (fd.get("note") as string) || null });
              }}
            >
              <label className="block text-xs text-neutral-500 mb-1">Admin Note</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  name="note"
                  defaultValue={order.adminNote || ""}
                  placeholder="Internal note..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={updating}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
