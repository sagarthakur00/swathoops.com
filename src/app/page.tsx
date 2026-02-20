import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import BrandFeatures from "@/components/BrandFeatures";
import CategoryShowcase from "@/components/CategoryShowcase";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BrandFeatures />
      <FeaturedProducts />
      <CategoryShowcase />
    </>
  );
}
