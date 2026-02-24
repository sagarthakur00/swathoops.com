"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductType, formatPrice } from "@/types/product";
import { useState } from "react";

interface ProductCardProps {
  product: ProductType;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link href={`/product/${product.slug}`}>
        <div
          className="group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-900">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-700 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Hover overlay with second image */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={product.images[1] || product.images[0]}
                alt={`${product.name} alternate`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-[10px] font-medium tracking-widest text-neutral-300 rounded-full uppercase">
                {product.category}
              </span>
            </div>

            {/* Sale Badge */}
            {product.discountPrice && (
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-amber-500 text-[10px] font-bold tracking-wider text-black rounded-full uppercase">
                  Sale
                </span>
              </div>
            )}

            {/* Quick View on Hover */}
            <div
              className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ${
                isHovered
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-lg py-2.5 text-center text-sm font-medium tracking-wider text-white uppercase">
                View Product
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white group-hover:text-amber-500 transition-colors tracking-wide">
                {product.name}
              </h3>
              <div
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: product.colorCode || undefined }}
              />
            </div>
            <p className="text-xs text-neutral-500">{product.description}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm font-semibold text-white">
                {formatPrice(product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-neutral-600 line-through">
                  {formatPrice(product.discountPrice)}
                </span>
              )}
              {product.isOutOfStock && (
                <span className="text-xs text-red-400 font-medium">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
