import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { TrendingProducts } from "@/components/home/TrendingProducts";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroBanner />
        <FeaturedCategories />
        <TrendingProducts />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
