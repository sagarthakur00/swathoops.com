"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ProductType, formatPrice } from "@/types/product";
import { useCart } from "@/context/CartContext";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);

  useEffect(() => {
    const slug = params.slug as string;
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data);
          // Fetch all products for related
          fetch("/api/products")
            .then((res) => res.json())
            .then((allProducts: ProductType[]) => {
              const related = allProducts
                .filter((p) => p.category === data.category && p.id !== data.id)
                .slice(0, 3);
              setRelatedProducts(related);
            });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Product Not Found
          </h1>
          <Link
            href="/shop"
            className="text-amber-500 hover:text-amber-400 transition-colors"
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const allImages = product.images;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }
    setShowSizeError(false);
    addToCart(product, selectedSize);
  };

  const related = relatedProducts;

  return (
    <div className="pt-20 md:pt-24 pb-24 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-6 flex items-center gap-2 text-xs text-neutral-500"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.category}`}
            className="hover:text-white transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-neutral-300">{product.name}</span>
        </motion.nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductGallery images={allImages} productName={product.name} />
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:pt-4"
          >
            {/* Category */}
            <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium tracking-widest text-neutral-400 uppercase mb-4">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {product.name}
            </h1>

            {/* SKU */}
            <p className="mt-2 text-xs text-neutral-600 tracking-wider">
              SKU: {product.sku}
            </p>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-lg text-neutral-600 line-through">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-medium rounded">
                    {Math.round(
                      ((product.discountPrice - product.price) /
                        product.discountPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="mt-6 text-neutral-400 leading-relaxed">
              {product.description}
            </p>

            {/* Divider */}
            <div className="my-6 border-t border-white/5" />

            {/* Color */}
            <div className="mb-6">
              <h3 className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">
                Color
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full ring-2 ring-amber-500 ring-offset-2 ring-offset-[#0a0a0a]"
                  style={{ backgroundColor: product.colorCode || undefined }}
                />
                <span className="text-sm text-white">{product.color}</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
                  Size (UK)
                </h3>
                {showSizeError && (
                  <span className="text-xs text-red-400">
                    Please select a size
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const variant = product.variants?.find((v) => v.size === size);
                  const sizeOutOfStock = variant ? variant.stock <= 0 : false;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (sizeOutOfStock) return;
                        setSelectedSize(size);
                        setShowSizeError(false);
                      }}
                      disabled={sizeOutOfStock}
                      className={`w-12 h-12 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                        sizeOutOfStock
                          ? "bg-white/[0.02] text-neutral-700 border border-white/5 cursor-not-allowed line-through"
                          : selectedSize === size
                          ? "bg-amber-500 text-black"
                          : "bg-white/5 text-white border border-white/10 hover:border-amber-500/50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.isOutOfStock}
              className={`w-full py-4 font-semibold tracking-wider uppercase text-sm rounded-lg transition-all duration-300 active:scale-[0.98] ${
                product.isOutOfStock
                  ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-400 text-black hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              }`}
            >
              {product.isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            {/* Stock */}
            <div className="mt-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="text-xs text-neutral-400">
                {product.isOutOfStock ? 'Out of stock' : `In stock (${product.stock} available)`}
              </span>
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-white/5" />

            {/* Details Accordion */}
            <div className="space-y-4">
              {/* Material & Quality */}
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer py-3">
                  <h3 className="text-sm font-medium text-white tracking-wider uppercase">
                    Material & Quality
                  </h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                <div className="pb-4 space-y-3 text-sm text-neutral-400">
                  <div className="flex justify-between">
                    <span>Material</span>
                    <span className="text-neutral-300">{product.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sole</span>
                    <span className="text-neutral-300">{product.sole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality</span>
                    <span className="text-neutral-300">{product.quality}</span>
                  </div>
                </div>
              </details>

              {/* Description */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer py-3 border-t border-white/5">
                  <h3 className="text-sm font-medium text-white tracking-wider uppercase">
                    Full Description
                  </h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                  <div className="pb-4 text-sm text-neutral-400 leading-relaxed">
                  {product.longDescription || product.description}
                </div>
              </details>

              {/* Shipping */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer py-3 border-t border-white/5">
                  <h3 className="text-sm font-medium text-white tracking-wider uppercase">
                    Shipping & Returns
                  </h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                <div className="pb-4 text-sm text-neutral-400 leading-relaxed space-y-2">
                  <p>Free shipping across India on all orders.</p>
                  <p>Delivery within 5–7 business days.</p>
                  <p>Easy 15-day return policy for unused items.</p>
                </div>
              </details>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <span className="inline-block text-[10px] sm:text-xs font-medium tracking-[0.3em] text-amber-500/80 uppercase mb-4">
                You May Also Like
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
