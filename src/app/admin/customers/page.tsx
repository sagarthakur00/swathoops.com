"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/types/product";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  orders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "text-yellow-500",
    confirmed: "text-blue-500",
    shipped: "text-purple-500",
    delivered: "text-green-500",
    cancelled: "text-red-500",
  };
  return colors[status] || "text-white";
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCustomers = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    fetch(`/api/admin/customers?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-white/5 rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider mb-6">
        Customers ({customers.length})
      </h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <p>No customers found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Customer Row */}
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === customer.id ? null : customer.id)
                }
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-500 font-semibold text-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {customer.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 ml-13 sm:ml-0">
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">Orders</p>
                    <p className="text-sm font-medium text-white">
                      {customer.totalOrders}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">Spent</p>
                    <p className="text-sm font-medium text-amber-500">
                      {formatPrice(customer.totalSpent)}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-neutral-500">Joined</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      expandedId === customer.id ? "rotate-180" : ""
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

              {/* Expanded - Order History */}
              {expandedId === customer.id && (
                <div className="border-t border-white/10 p-4 sm:p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xs text-neutral-500 uppercase tracking-wider">
                      Contact
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 text-xs text-neutral-400">
                    <p>Phone: {customer.phone}</p>
                    <p>Email: {customer.email}</p>
                    <p>
                      Joined:{" "}
                      {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                    Order History ({customer.orders.length})
                  </h3>

                  {customer.orders.length === 0 ? (
                    <p className="text-xs text-neutral-500">No orders yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {customer.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                        >
                          <div>
                            <p className="text-xs text-neutral-400 font-mono">
                              #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short", year: "2-digit" }
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] uppercase tracking-wider ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span className="text-sm text-white font-medium">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
