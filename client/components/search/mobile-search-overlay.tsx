'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, X, Clock, Flame } from 'lucide-react';
import { Product } from '../../lib/types';

// Utility to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export function MobileSearchOverlay() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ledamas_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const saveRecentSearch = (q: string) => {
    if (!q.trim()) return;
    const term = q.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('ledamas_recent_searches', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('ledamas_recent_searches');
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/v1/products?search=${encodeURIComponent(query.trim())}`, {
          signal: abortController.signal
        });
        const data = await res.json();
        
        if (data.success) {
          setResults(data.data.slice(0, 8)); // Max 8 results
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search fetch error:', err);
        }
      } finally {
        if (abortControllerRef.current === abortController) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="font-bold text-stone-900">{part}</span> : part
        )}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col">
      {/* Top Search Bar */}
      <div className="flex items-center px-4 py-3 border-b border-stone-200 bg-white gap-3">
        <button 
          onClick={() => router.back()} 
          className="p-1 -ml-1 text-stone-600 hover:text-stone-900 outline-none active:opacity-70"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-stone-400" />
          <input
            type="search"
            enterKeyHint="search"
            placeholder="Search chocolates, gift boxes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-stone-100 border-none rounded-xl text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-[#CB9700] text-[16px]"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 outline-none active:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {query.trim().length >= 2 ? (
          // Search Results State
          <div className="py-2">
            {isLoading ? (
              // Skeleton Loader
              <div className="px-4 space-y-4 mt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-stone-200 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-stone-200 rounded w-3/4" />
                      <div className="h-3 bg-stone-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              // Results List
              <div className="flex flex-col">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => saveRecentSearch(query)}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-0 active:bg-stone-50"
                  >
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      <Image
                        src={product.images?.[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-stone-800 truncate">
                        {renderHighlightedText(product.name, query)}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[13px] font-semibold text-[#CB9700]">
                          {formatPrice(product.price)}
                        </span>
                        {(!product.inStock || product.availability === 'OutOfStock') && (
                          <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                
                <button 
                  onClick={handleSubmit}
                  className="mt-2 mx-4 py-3 text-sm text-center font-semibold text-[#CB9700] hover:text-[#b38500] hover:bg-amber-50 rounded-lg transition-colors active:opacity-70"
                >
                  View all results for "{query}"
                </button>
              </div>
            ) : (
              // No Results
              <div className="px-6 py-12 text-center">
                <p className="text-stone-500 mb-6 font-medium">No results found for "{query}"</p>
                <div className="text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Popular Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Kunafa Chocolate', 'Dark Chocolate', 'Milk Chocolate', 'Gift Boxes'].map((cat) => (
                      <Link
                        key={cat}
                        href={`/shop?search=${encodeURIComponent(cat)}`}
                        className="px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-sm font-medium hover:bg-stone-200 active:scale-95 transition-transform"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty State (Recent & Trending)
          <div className="px-4 py-6 space-y-8">
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-stone-900">Recent Searches</h3>
                  <button onClick={clearRecentSearches} className="text-xs font-medium text-stone-500 hover:text-stone-800 active:opacity-70">
                    Clear
                  </button>
                </div>
                <div className="flex flex-col">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(term);
                      }}
                      className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0 text-left active:bg-stone-50"
                    >
                      <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                      <span className="flex-1 text-sm text-stone-700">{term}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FE825C]" /> Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Dubai Chocolate', 'Pistachio Kunafa', 'Mini Bars', 'Speculoos'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?search=${encodeURIComponent(cat)}`}
                    className="px-4 py-2 bg-stone-100 border border-stone-200 text-stone-800 rounded-full text-sm hover:bg-stone-200 transition-colors active:scale-95"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
