'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';
import { useWishlistStore } from '../../components/wishlist/wishlist-store';
import { useCart } from '../../lib/context/cart-context';

export default function WishlistPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const rawWishlistItems = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const { addItem } = useCart();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const wishlistItems = isMounted ? rawWishlistItems : [];

  return (
    <div className="min-h-screen bg-[#0F0D0C] text-white flex flex-col justify-between font-sans">
      <Header />

      <main className="flex-1 max-w-[1480px] w-full mx-auto px-6 lg:px-12 pt-44 sm:pt-48 md:pt-52 pb-16">
        {/* Title Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-light tracking-wide">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 font-sans">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State Box matching CarbonSmith screenshot */
          <div className="bg-[#FAF9F6] text-[#2B2825] rounded-3xl p-10 sm:p-16 text-center border border-[#EBE4D8] shadow-xl max-w-3xl mx-auto my-6">
            <div className="w-16 h-16 rounded-full bg-[#F2EDE4] text-[#595550] flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Heart className="w-8 h-8 text-stone-400" />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2825] font-semibold mb-2">
              Your wishlist is empty
            </h2>

            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-8 leading-relaxed font-sans">
              Save items you love to your wishlist. Review them anytime and easily move them to your cart.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-md bg-[#2B2825] text-white text-xs font-sans font-semibold uppercase tracking-widest hover:bg-[#CB9700] active:scale-[0.98] transition-all shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="group bg-[#141110] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-[#2AD2C5] transition-all shadow-lg relative overflow-hidden"
              >
                {/* Delete Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-red-600 text-stone-300 hover:text-white transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  {/* Product Image */}
                  <Link href={`/products/${item.slug}`} className="block relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 mb-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 250px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Product Info */}
                  <h3 className="font-serif text-lg text-white font-semibold line-clamp-1 group-hover:text-[#2AD2C5] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm font-bold text-[#CB9700] mt-1 font-sans">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Move to Cart Action Button */}
                <button
                  onClick={() => {
                    addItem({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      images: [item.image],
                    });
                  }}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-[#2AD2C5] text-white text-xs font-sans uppercase tracking-widest font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
