"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/types/product";

const values = [
  {
    title: "Craftsmanship",
    description:
      "Every pair is handcrafted by skilled artisans who bring decades of experience to each stitch, cut, and finish.",
  },
  {
    title: "Premium Materials",
    description:
      "We source only the finest leathers, suedes, and fabrics from trusted tanneries and mills around the world.",
  },
  {
    title: "Timeless Design",
    description:
      "Our designs transcend trends. We create shoes that look as good years from now as they do today.",
  },
  {
    title: "Comfort First",
    description:
      "Every shoe features ergonomic insoles and supportive construction for all-day comfort without compromise.",
  },
];

export default function AboutPage() {
  const [heroImage, setHeroImage] = useState<string>("https://qtaxonslq0sfxcs2.public.blob.vercel-storage.com/images/lifestyle/1brown_lofer_design.JPG");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: ProductType[]) => {
        if (data.length > 6 && data[6].images.length > 0) {
          setHeroImage(data[6].images[data[6].images.length - 1]);
        } else if (data.length > 0 && data[0].images.length > 0) {
          setHeroImage(data[0].images[data[0].images.length - 1]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-20 md:pt-24 pb-24 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center py-16 md:py-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[10px] sm:text-xs font-medium tracking-[0.3em] text-amber-500/80 uppercase mb-4"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight"
          >
            Built for the
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Modern Man
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-neutral-400 max-w-2xl mx-auto leading-relaxed text-lg"
          >
            SWATHOOPS was born from a simple belief: that every man deserves
            shoes that combine uncompromising quality with timeless design. We
            don&apos;t follow trends — we set standards.
          </motion.p>
        </div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden mb-24"
        >
          <Image
            src={heroImage}
            alt="SWATHOOPS Craftsmanship"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-sm text-neutral-300 max-w-md">
              &quot;We believe great shoes are the foundation of confidence. Every detail
              matters.&quot;
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            >
              What We Stand For
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-colors duration-500"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                  <span className="text-lg font-bold">{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-y border-white/5 mb-24"
        >
          {[
            { value: "10+", label: "Unique Styles" },
            { value: "1000+", label: "Happy Customers" },
            { value: "100%", label: "Handcrafted" },
            { value: "15 Day", label: "Easy Returns" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-xs text-neutral-500 tracking-widest uppercase mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Ready to Experience the Difference?
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm tracking-widest uppercase rounded-lg transition-all duration-300"
          >
            Shop the Collection
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
