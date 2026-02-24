"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { APP_CONFIG, PAYMENT_CONFIG, THEME } from "@/config/client";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface CheckoutSettings {
  codEnabled: boolean;
  razorpayEnabled: boolean;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(
    "razorpay"
  );
  const [settings, setSettings] = useState<CheckoutSettings>({
    codEnabled: false,
    razorpayEnabled: true,
  });
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch checkout settings on mount
  useEffect(() => {
    fetch("/api/checkout/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        if (data.razorpayEnabled) {
          setPaymentMethod("razorpay");
        } else if (data.codEnabled) {
          setPaymentMethod("cod");
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------- COD flow ----------
  const handleCODOrder = useCallback(async () => {
    const orderData = {
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
      },
      address: {
        fullName: form.name,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "India",
      },
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size,
      })),
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to place order");

    sessionStorage.setItem("lastOrder", JSON.stringify(data));
    clearCart();
    router.push("/order-confirmation");
  }, [form, items, clearCart, router]);

  // ---------- Razorpay flow ----------
  const handleRazorpayOrder = useCallback(async () => {
    const orderPayload = {
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
      },
      address: {
        fullName: form.name,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "India",
      },
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        size: item.size,
      })),
    };

    // 1. Create Razorpay order on server
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create order");

    // 2. Open Razorpay checkout
    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: APP_CONFIG.name,
      description: `${APP_CONFIG.description} Purchase`,
      order_id: data.razorpayOrderId,
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: {
        color: THEME.brandColor,
      },
      handler: async function (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) {
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.orderId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok)
            throw new Error(verifyData.error || "Payment verification failed");

          sessionStorage.setItem("lastOrder", JSON.stringify(verifyData.order));
          clearCart();
          router.push("/order-confirmation");
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Payment verification failed"
          );
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          setError("Payment was cancelled. You can try again.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [form, items, clearCart, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (paymentMethod === "razorpay") {
        if (!scriptLoaded) {
          throw new Error(
            "Payment gateway is loading. Please try again in a moment."
          );
        }
        await handleRazorpayOrder();
      } else {
        await handleCODOrder();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Cart is Empty</h1>
          <Link
            href="/shop"
            className="text-amber-500 hover:text-amber-400 transition-colors"
          >
            &#8592; Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load Razorpay checkout.js */}
      <Script
        src={PAYMENT_CONFIG.razorpayScriptUrl}
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="pt-20 md:pt-24 pb-24 bg-[#0a0a0a] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight py-8 text-center"
          >
            Checkout
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Form */}
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Contact Info */}
              <div>
                <h2 className="text-lg font-semibold text-white tracking-wider uppercase mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-semibold text-white tracking-wider uppercase mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="Address Line 1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <input
                    type="text"
                    name="addressLine2"
                    placeholder="Address Line 2 (Optional)"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={form.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="PIN Code"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-semibold text-white tracking-wider uppercase mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {/* Razorpay Online Payment */}
                  {settings.razorpayEnabled && (
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        paymentMethod === "razorpay"
                          ? "border-amber-500/60 bg-amber-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === "razorpay"}
                        onChange={() => setPaymentMethod("razorpay")}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                          </svg>
                          <span className="text-white font-medium text-sm">Pay Online</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          UPI, Cards, Net Banking, Wallets
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-neutral-500 bg-white/10 px-2 py-0.5 rounded-full">
                          Razorpay
                        </span>
                      </div>
                    </label>
                  )}

                  {/* COD */}
                  {settings.codEnabled && (
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        paymentMethod === "cod"
                          ? "border-amber-500/60 bg-amber-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                          </svg>
                          <span className="text-white font-medium text-sm">Cash on Delivery</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          Pay when you receive your order
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold tracking-wider uppercase text-sm rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Processing..."
                  : paymentMethod === "razorpay"
                  ? `Pay ${formatPrice(totalPrice)}`
                  : "Place Order (Cash on Delivery)"}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <span>Secure payment powered by Razorpay</span>
              </div>
            </motion.form>

            {/* Right: Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-28">
                <h2 className="text-lg font-semibold text-white tracking-wider uppercase mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="flex gap-4"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-900">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Size: UK {item.size} &times; {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Subtotal</span>
                    <span className="text-white">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span className="text-amber-500">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
