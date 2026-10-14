import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // @ts-ignore
  allowedDevOrigins: ['192.168.1.6'],
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:5000/api/v1/:path*',
      },
    ];
  },
  async redirects() {
    return [
      // ─── Product slug migrations (old → new) ────────────────────────────
      {
        source: '/products/white-chocolate-hazelnut-creme-1',
        destination: '/products/white-chocolate-hazelnut-creme-200g',
        permanent: true,
      },
      {
        source: '/products/speculoos-cream-kunafa-compound-chocolate',
        destination: '/products/speculoos-creme-kunafa-110g',
        permanent: true,
      },
      {
        source: '/products/kunafa-pistachio-dark-chocolate',
        destination: '/products/kunafa-pistachio-dark-chocolate-200g',
        permanent: true,
      },
      {
        source: '/products/hazelnut-creme-dubai-milk-chocolate',
        destination: '/products/hazelnut-creme-milk-chocolate-110g',
        permanent: true,
      },

      // ─── Old Shopify URLs ────────────────────────────────────────────────
      {
        source: '/collections/all',
        destination: '/shop',
        permanent: true,
      },

      {
        source: '/pages/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/pages/contact',
        destination: '/contact',
        permanent: true,
      },

      // ─── Old Shopify product slugs not on new site → /shop ──────────────
      {
        source: '/products/kunafa-pistachio-milk-chocolate',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/kunafa-pistachio-cream',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/crispy-speculoos-cream-milk-chocolate',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/lebubu-milk-chocolate-kunafa-pistachio-filling',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/hazelnut-creme-milk-chocolate-mini-bar',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/kunafa-pistachio-milk-chocolate-mini-bar',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/kunafa-pistachio-dark-chocolate-mini-bar',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/crispy-speculoos-cream-milk-chocolate-mini-bar',
        destination: '/shop',
        permanent: true,
      },

      // ─── Any other old /pages/* → /shop ─────────────────────────────────
      {
        source: '/pages/:slug',
        destination: '/shop',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
