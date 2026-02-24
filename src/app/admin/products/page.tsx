"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ProductType, ProductVariantType, formatPrice } from "@/types/product";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";
import Link from "next/link";

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});
  const [editVariants, setEditVariants] = useState<ProductVariantType[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    action: () => void;
  }>({ show: false, title: "", action: () => {} });

  const fetchProducts = useCallback(() => {
    const params = new URLSearchParams();
    params.set("activeOnly", "false");
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    if (stockFilter) params.set("stockStatus", stockFilter);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, categoryFilter, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const startEdit = (product: ProductType) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      description: product.description,
      longDescription: product.longDescription,
      material: product.material,
      sole: product.sole,
      quality: product.quality,
      color: product.color,
      colorCode: product.colorCode,
      category: product.category,
      images: product.images,
    });
    setEditVariants(
      product.variants?.map((v) => ({ ...v })) ||
        product.sizes.map((s) => ({
          id: "",
          productId: product.id,
          size: s,
          stock: Math.floor(product.stock / product.sizes.length),
          isOutOfStock: false,
        }))
    );
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          variants: editVariants.map((v) => ({ size: v.size, stock: v.stock })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      addToast("Product updated successfully!", "success");
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Update failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (
    id: string,
    field: string,
    currentValue: boolean
  ) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      if (!res.ok) throw new Error("Failed");
      addToast(`Product ${field.replace("is", "").toLowerCase()} updated`, "success");
      fetchProducts();
    } catch {
      addToast("Update failed", "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditForm((prev) => ({
        ...prev,
        images: [...((prev.images as string[]) || []), ...data.urls],
      }));
      addToast("Images uploaded!", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Upload failed",
        "error"
      );
    }
  };

  const removeImage = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      images: ((prev.images as string[]) || []).filter(
        (_: string, i: number) => i !== index
      ),
    }));
  };

  const addVariantRow = () => {
    const existing = editVariants.map((v) => v.size);
    const nextSize = [6, 7, 8, 9, 10, 11, 12].find(
      (s) => !existing.includes(s)
    );
    if (nextSize === undefined) return;
    setEditVariants((prev) => [
      ...prev,
      {
        id: "",
        productId: editingId || "",
        size: nextSize,
        stock: 0,
        isOutOfStock: true,
      },
    ]);
  };

  const removeVariantRow = (index: number) => {
    setEditVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ] as string[];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-white/5 rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Confirm Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 confirm-backdrop">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4">
            <p className="text-white text-sm mb-6">{confirmDialog.title}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setConfirmDialog({ show: false, title: "", action: () => {} })
                }
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.action();
                  setConfirmDialog({ show: false, title: "", action: () => {} });
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
          Products ({products.length})
        </h1>
        <Link
          href="/admin/products/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
        >
          <option value="" className="bg-[#111]">
            All Categories
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-[#111]">
              {cat}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
        >
          <option value="" className="bg-[#111]">All Stock</option>
          <option value="in-stock" className="bg-[#111]">In Stock</option>
          <option value="out-of-stock" className="bg-[#111]">Out of Stock</option>
        </select>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`bg-white/5 border rounded-xl overflow-hidden ${
              !product.isActive
                ? "border-red-500/20 opacity-60"
                : "border-white/10"
            }`}
          >
            {editingId === product.id ? (
              /* ===== EDIT MODE ===== */
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-amber-500 truncate">
                    Editing: {product.name}
                  </h3>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-neutral-400 hover:text-white text-sm flex-shrink-0 ml-4"
                  >
                    Cancel
                  </button>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={(editForm.name as string) || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Category</label>
                    <input
                      type="text"
                      value={(editForm.category as string) || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Material</label>
                    <input
                      type="text"
                      value={(editForm.material as string) || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, material: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Price</label>
                    <input
                      type="number"
                      value={(editForm.price as number) || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, price: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Discount Price</label>
                    <input
                      type="number"
                      value={(editForm.discountPrice as number) || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          discountPrice: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={(editForm.color as string) || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, color: e.target.value }))
                        }
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                      />
                      <input
                        type="color"
                        value={(editForm.colorCode as string) || "#000000"}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, colorCode: e.target.value }))
                        }
                        className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Description</label>
                  <textarea
                    value={(editForm.description as string) || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Size Variants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">
                      Size-based Stock
                    </label>
                    <button
                      onClick={addVariantRow}
                      className="text-xs text-amber-500 hover:text-amber-400"
                    >
                      + Add Size
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {editVariants.map((v, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg p-2"
                      >
                        <span className="text-xs text-neutral-400 w-8">
                          UK {v.size}
                        </span>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditVariants((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, stock: val, isOutOfStock: val <= 0 }
                                  : item
                              )
                            );
                          }}
                          className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs text-center focus:outline-none focus:border-amber-500/50"
                          min={0}
                        />
                        <button
                          onClick={() => removeVariantRow(idx)}
                          className="text-neutral-500 hover:text-red-400 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">
                      Images
                    </label>
                    <label className="text-xs text-amber-500 hover:text-amber-400 cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      + Upload
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {((editForm.images as string[]) || []).map(
                      (img: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-lg overflow-hidden group"
                        >
                          <Image
                            src={img}
                            alt={`Product ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-lg transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Save */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        show: true,
                        title: "Save changes to this product?",
                        action: handleSave,
                      })
                    }
                    disabled={saving}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-6 py-2.5 border border-white/10 text-neutral-400 hover:text-white text-sm rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ===== VIEW MODE ===== */
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-white truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate">
                      {product.sku} &middot; {product.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-semibold text-amber-500">
                        {formatPrice(product.price)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-neutral-600 line-through">
                          {formatPrice(product.discountPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggles & Stock */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                  {/* Active */}
                  <button
                    onClick={() =>
                      toggleField(product.id, "isActive", product.isActive)
                    }
                    className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-medium border ${
                      product.isActive
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </button>
                  {/* Featured */}
                  <button
                    onClick={() =>
                      toggleField(product.id, "isFeatured", product.isFeatured)
                    }
                    className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-medium border ${
                      product.isFeatured
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-white/5 border-white/10 text-neutral-500"
                    }`}
                  >
                    Featured
                  </button>
                  {/* On Sale */}
                  <button
                    onClick={() =>
                      toggleField(product.id, "isOnSale", product.isOnSale)
                    }
                    className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-medium border ${
                      product.isOnSale
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                        : "bg-white/5 border-white/10 text-neutral-500"
                    }`}
                  >
                    Sale
                  </button>
                  {/* Stock */}
                  <div className="text-right min-w-[50px]">
                    <p className="text-[10px] text-neutral-500">Stock</p>
                    <p
                      className={`text-sm font-medium ${
                        product.isOutOfStock ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {product.isOutOfStock ? "Out" : product.stock}
                    </p>
                  </div>
                  {/* Edit */}
                  <button
                    onClick={() => startEdit(product)}
                    className="px-3 py-2 bg-white/5 border border-white/10 hover:border-amber-500/50 text-white text-xs tracking-wider uppercase rounded-lg transition-all"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 text-neutral-500">
          <p>No products found.</p>
        </div>
      )}
    </div>
  );
}
