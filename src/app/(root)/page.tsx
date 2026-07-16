import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PopularCategories from "@/components/home/PopularCategories";
import SuccessStories from "@/components/home/SuccessStories";
import MarketplaceStats from "@/components/home/MarketplaceStats";
import SustainabilitySection from "@/components/home/SustainabilitySection";
import TrustedSellers from "@/components/home/TrustedSellers";
import { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <HeroSection />
      <FeaturedProducts />
      <PopularCategories />
      <SuccessStories />
      <MarketplaceStats />
      <SustainabilitySection />
      <TrustedSellers />
    </main>
  );
}