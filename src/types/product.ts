// Shared product type used across frontend
export interface ProductVariantType {
  id: string;
  productId: string;
  size: number;
  stock: number;
  isOutOfStock: boolean;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice: number | null;
  description: string;
  longDescription: string | null;
  material: string;
  sole: string | null;
  quality: string | null;
  color: string | null;
  colorCode: string | null;
  category: string | null;
  sizes: number[];
  stock: number;
  isOutOfStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  images: string[];
  variants?: ProductVariantType[];
  createdAt: string;
  updatedAt?: string;
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}
