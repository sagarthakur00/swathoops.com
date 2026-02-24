"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

interface VariantInput {
  size: number;
  stock: number;
}

export default function AddProductPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Casual",
    price: "",
    discountPrice: "",
    description: "",
    longDescription: "",
    material: "",
    sole: "",
    quality: "",
    color: "",
    colorCode: "#000000",
  });

  const [variants, setVariants] = useState<VariantInput[]>([
    { size: 6, stock: 10 },
    { size: 7, stock: 10 },
    { size: 8, stock: 10 },
    { size: 9, stock: 10 },
    { size: 10, stock: 10 },
  ]);

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
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

      setImages((prev) => [...prev, ...data.urls]);
      addToast("Images uploaded!", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Upload failed",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    const existing = variants.map((v) => v.size);
    const nextSize = [6, 7, 8, 9, 10, 11, 12, 13].find(
      (s) => !existing.includes(s)
    );
    if (nextSize === undefined) return;
    setVariants((prev) => [...prev, { size: nextSize, stock: 10 }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return addToast("Name is required", "error");
    if (!form.sku.trim()) return addToast("SKU is required", "error");
    if (!form.price) return addToast("Price is required", "error");
    if (images.length === 0) return addToast("At least one image is required", "error");
    if (variants.length === 0) return addToast("At least one size variant is required", "error");

    setSaving(true);

    try {
      const body = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        description: form.description.trim(),
        longDescription: form.longDescription.trim(),
        material: form.material.trim(),
        sole: form.sole.trim(),
        quality: form.quality.trim(),
        color: form.color.trim(),
        colorCode: form.colorCode,
        images,
        sizes: variants.map((v) => v.size),
        variants: variants.map((v) => ({ size: v.size, stock: v.stock })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create product");
      }

      addToast("Product created successfully!", "success");
      router.push("/admin/products");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Creation failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
          Add New Product
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Classic Oxford"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">SKU *</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                placeholder="e.g. SWAT-OXF-001"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50"
              >
                <option value="Casual" className="bg-[#111]">Casual</option>
                <option value="Formal" className="bg-[#111]">Formal</option>
                <option value="Sports" className="bg-[#111]">Sports</option>
                <option value="Boots" className="bg-[#111]">Boots</option>
                <option value="Sandals" className="bg-[#111]">Sandals</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Material</label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}
                placeholder="e.g. Premium Leather"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-4">
            Pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Selling Price (INR) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="2499"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Original Price (MRP)</label>
              <input
                type="number"
                value={form.discountPrice}
                onChange={(e) => setForm((prev) => ({ ...prev, discountPrice: e.target.value }))}
                placeholder="4999"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-4">
            Product Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Short Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                placeholder="Brief product description..."
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Long Description</label>
              <textarea
                value={form.longDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, longDescription: e.target.value }))}
                rows={4}
                placeholder="Detailed product description..."
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Sole</label>
                <input
                  type="text"
                  value={form.sole}
                  onChange={(e) => setForm((prev) => ({ ...prev, sole: e.target.value }))}
                  placeholder="e.g. Rubber"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Quality</label>
                <input
                  type="text"
                  value={form.quality}
                  onChange={(e) => setForm((prev) => ({ ...prev, quality: e.target.value }))}
                  placeholder="e.g. Premium"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                    placeholder="e.g. Black"
                    className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <input
                    type="color"
                    value={form.colorCode}
                    onChange={(e) => setForm((prev) => ({ ...prev, colorCode: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Size Variants */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider">
              Size & Stock
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="text-xs text-amber-500 hover:text-amber-400"
            >
              + Add Size
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] border border-white/10 rounded-lg p-3 text-center"
              >
                <p className="text-xs text-neutral-400 mb-2">UK {v.size}</p>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVariants((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, stock: val } : item
                      )
                    );
                  }}
                  min={0}
                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm text-center focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="text-xs text-neutral-500 hover:text-red-400 mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider">
              Images *
            </h2>
            <label className="text-xs text-amber-500 hover:text-amber-400 cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploading ? "Uploading..." : "+ Upload Images"}
            </label>
          </div>
          {images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-lg overflow-hidden group"
                >
                  <Image
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 text-xl transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center">
              <p className="text-sm text-neutral-500">
                No images uploaded yet. Click &quot;+ Upload Images&quot; above.
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 border border-white/10 text-neutral-400 hover:text-white text-sm rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
