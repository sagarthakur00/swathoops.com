"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";

const categories = [
  {
    name: "Loafers",
    description: "Effortless elegance",
    image: products.find((p) => p.category === "Loafers")!.images.creative[0],
  },
  {
    name: "Formal",
    description: "Refined sophistication",
    image: products.find((p) => p.category === "Formal")!.images.creative[0],
  },
  {
    name: "Casual",
    description: "Everyday comfort",
    image: products.find((p) => p.category === "Casual")!.images.creative[0],
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-[10px] sm:text-xs font-medium tracking-[0.3em] text-amber-500/80 uppercase mb-4"
          >
            Explore
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            Shop by Category
          </motion.h2>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <Link href={`/shop?category=${cat.name}`}>
                <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs text-amber-500/80 tracking-widest uppercase mb-1">
                      {cat.description}
                    </p>
                    <h3 className="text-2xl font-bold text-white">
                      {cat.name}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-sm text-white/70 group-hover:text-white transition-colors">
                      <span>Explore</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
