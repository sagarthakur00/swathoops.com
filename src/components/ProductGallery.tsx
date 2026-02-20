"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleSelect = useCallback(
    (index: number) => {
      setDirection(index > selectedIndex ? 1 : -1);
      setSelectedIndex(index);
    },
    [selectedIndex]
  );

  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      (e.currentTarget as HTMLElement).dataset.startX = String(touch.clientX);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const startX = Number(
        (e.currentTarget as HTMLElement).dataset.startX || 0
      );
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0 && selectedIndex < images.length - 1) {
          handleSelect(selectedIndex + 1);
        } else if (diff < 0 && selectedIndex > 0) {
          handleSelect(selectedIndex - 1);
        }
      }
    },
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Vertical Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[600px] pb-2 md:pb-0 md:pr-2 scrollbar-hide">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-300 ${
              selectedIndex === i
                ? "ring-2 ring-amber-500 opacity-100"
                : "ring-1 ring-white/10 opacity-50 hover:opacity-80"
            }`}
          >
            <Image
              src={img}
              alt={`${productName} view ${i + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div
        className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-neutral-900"
        {...swipeHandlers}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={selectedIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[selectedIndex]}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white/70">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Mobile navigation dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                selectedIndex === i
                  ? "bg-amber-500 w-4"
                  : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
