"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/types/product";
import Link from "next/link";

interface OrderData {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    product: { name: string; images: string[] };
    quantity: number;
    size: number;
    price: number;
  }>;
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastOrder");
    if (stored) {
      setOrder(JSON.parse(stored));
      sessionStorage.removeItem("lastOrder");
    }
  }, []);

  if (!order) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            No Order Found
          </h1>
          <Link href="/shop" className="text-amber-500">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12"
        >
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10 text-green-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-neutral-400 mb-8">
            Thank you for your order. We&apos;ll deliver it soon.
          </p>

          {/* Order Details */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  Order ID
                </p>
                <p className="text-sm font-mono text-amber-500">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  Total
                </p>
                <p className="text-lg font-bold text-white">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                Items
              </p>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-2 text-sm">
                  <span className="text-neutral-300">
                    {item.product.name} (UK {item.size}) × {item.quantity}
                  </span>
                  <span className="text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Status</span>
                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-xs uppercase">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-neutral-400">Payment</span>
                <span className="text-neutral-300">Cash on Delivery</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-500 mb-6">
            Save your Order ID: <span className="text-amber-500 font-mono">{order.id}</span> to track your order.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/track-order"
              className="px-8 py-3 border border-white/10 hover:border-amber-500/50 text-white hover:text-amber-500 text-sm tracking-widest uppercase rounded-lg transition-all"
            >
              Track Order
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold tracking-widest uppercase rounded-lg transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
