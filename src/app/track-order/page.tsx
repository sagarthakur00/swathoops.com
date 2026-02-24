"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/types/product";
import Image from "next/image";

interface TrackedOrder {
  id: string;
  status: string;
  trackingNumber: string | null;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    size: number;
    price: number;
    image: string;
  }>;
}

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to track order");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="pt-20 md:pt-24 pb-24 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            Track Your Order
          </h1>
          <p className="text-neutral-400 mb-8">
            Enter your order ID and phone number to check status.
          </p>

          <form onSubmit={handleTrack} className="space-y-4 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold tracking-wider uppercase text-sm rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm max-w-md mx-auto">
              {error}
            </div>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 bg-white/5 border border-white/10 rounded-xl p-6 text-left"
            >
              {/* Order Info */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">
                    Order ID
                  </p>
                  <p className="text-sm font-mono text-amber-500">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">
                    Placed on
                  </p>
                  <p className="text-sm text-neutral-300">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mb-8">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-4">
                  Order Status
                </p>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-amber-500 transition-all"
                    style={{
                      width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%`,
                    }}
                  />
                  {statusSteps.map((step, i) => (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          i <= currentStep
                            ? "bg-amber-500 text-black"
                            : "bg-white/10 text-neutral-500"
                        }`}
                      >
                        {i <= currentStep ? "✓" : i + 1}
                      </div>
                      <span
                        className={`mt-2 text-[10px] uppercase tracking-wider ${
                          i <= currentStep ? "text-amber-500" : "text-neutral-600"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mb-6 p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">
                    Tracking Number
                  </p>
                  <p className="text-sm font-mono text-white">
                    {order.trackingNumber}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                  Items
                </p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3 py-3 border-b border-white/5 last:border-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.productName}</p>
                      <p className="text-xs text-neutral-500">
                        Size: UK {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-white/10 pt-4 mt-2 flex justify-between">
                <span className="text-neutral-400">Total</span>
                <span className="text-lg font-bold text-amber-500">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
