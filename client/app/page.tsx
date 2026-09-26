import React from 'react';
import { Header } from '@/components/layout/header';
import { AnimatedHero } from '@/components/AnimatedHero/AnimatedHero';
import { FeaturedCollection } from '@/components/home/featured-collection';
import { CategoryExploreSection } from '@/components/home/category-explore-section';
import { WhereWeAreAvailable } from '@/components/home/where-we-are-available';
import { TestimonialsCarousel } from '@/components/home/testimonials-carousel';
import { InstagramGallery } from '@/components/home/instagram-gallery';
import { Footer } from '@/components/layout/footer';
import { PageLoader } from '@/components/ui/page-loader';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0D0C] text-white">
      {/* Animated Loading Screen */}
      <PageLoader />

      {/* Sticky Minimal Navigation Header */}
      <Header />

      {/* Main Luxury Experience Flow */}
      <main className="flex-1">
        {/* 1. Animated Hero Landing */}
        <AnimatedHero />

        {/* 2. Featured Collection ("Best Sellers & Trending") */}
        <FeaturedCollection />

        {/* 3. CarbonSmith-Style Category Sidebar Showcase */}
        <CategoryExploreSection />

        {/* 4. Where We're Available (Delivery Apps & Retail Network) */}
        <WhereWeAreAvailable />

        {/* 5. Testimonials & Instagram */}
        <TestimonialsCarousel />
        <InstagramGallery />
      </main>

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}
