'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Heart, Menu, X, ChevronDown, ChevronRight, User, ArrowRight, Package, Sparkles, Layers, LogOut, UserCheck } from 'lucide-react';
import { useWishlistStore } from '../wishlist/wishlist-store';
import { useCart } from '../../lib/context/cart-context';
import { useAuth } from '../../lib/context/auth-context';
import { CartDrawer } from '../cart/cart-drawer';
import { BulkOrderModal } from '../ui/bulk-order-modal';
import { LoginModal } from '../ui/login-modal';
import { PRODUCTS } from '../../lib/products';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, loginModalOpen, openLoginModal, closeLoginModal, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredCollectionKey, setHoveredCollectionKey] = useState<string>('kunafa-pistachio');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const collectionCategories = [
    {
      key: 'kunafa-pistachio',
      name: 'Kunafa Pistachio',
      href: '/collections/kunafa-chocolate',
      filterFn: (p: any) => p.categorySlug === 'kunafa-chocolate' || p.slug.includes('kunafa') || p.name.toLowerCase().includes('kunafa'),
    },
    {
      key: 'milk-chocolate',
      name: 'Milk Chocolate',
      href: '/collections/milk-chocolate',
      filterFn: (p: any) => p.categorySlug === 'milk-chocolate' || p.slug.includes('milk') || p.name.toLowerCase().includes('milk'),
    },
    {
      key: 'mini-bars',
      name: 'Mini Bars',
      href: '/collections/mini-chocolate-bars',
      filterFn: (p: any) => p.categorySlug === 'mini-chocolate-bars' || p.slug.includes('mini') || p.name.toLowerCase().includes('mini') || p.name.toLowerCase().includes('35g'),
    },
    {
      key: 'speculoos',
      name: 'Speculoos',
      href: '/collections/speculoos-chocolate',
      filterFn: (p: any) => p.categorySlug === 'speculoos' || p.slug.includes('speculoos') || p.name.toLowerCase().includes('speculoos'),
    },
    {
      key: 'dark-chocolate',
      name: 'Dark Chocolate',
      href: '/collections/dark-chocolate',
      filterFn: (p: any) => p.categorySlug === 'dark-chocolate' || p.slug.includes('dark') || p.name.toLowerCase().includes('dark'),
    },
    {
      key: 'lebubu',
      name: 'Lebubu',
      href: '/collections/lebubu',
      filterFn: (p: any) => p.categorySlug === 'lebubu' || p.slug.includes('lebubu') || p.name.toLowerCase().includes('lebubu'),
    },
  ];

  const activeCollectionCategory = React.useMemo(() => {
    return collectionCategories.find((c) => c.key === hoveredCollectionKey) || collectionCategories[0];
  }, [hoveredCollectionKey]);

  const dropdownFeaturedProducts = React.useMemo(() => {
    return PRODUCTS.filter(activeCollectionCategory.filterFn).slice(0, 4);
  }, [activeCollectionCategory]);

  const rawWishlistCount = useWishlistStore((state) => state.items.length);
  const wishlistCount = isMounted ? rawWishlistCount : 0;
  const { totalItems, openCart } = useCart();

  const getHeaderDisplayName = () => {
    if (!user) return 'Account';
    if (user.name && !user.name.startsWith('Customer +') && !user.name.startsWith('Guest User')) {
      return user.name;
    }
    if (user.phone && !user.phone.startsWith('google_')) {
      const cleaned = user.phone.replace(/\D/g, '').slice(-10);
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'Connoisseur';
  };

  const getUserInitial = () => {
    if (!user) return 'C';
    if (user.name && !user.name.startsWith('Customer +') && !user.name.startsWith('Guest User')) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'C';
  };

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      name: 'HOME',
      href: '/',
      hasDropdown: false,
    },
    {
      name: 'TRENDING',
      href: '/trending',
      hasDropdown: true,
      id: 'trending',
    },
    {
      name: 'COLLECTIONS',
      href: '/collections',
      hasDropdown: true,
      id: 'collections',
    },
    {
      name: 'BULK & GIFTING',
      href: '#bulk-enquiry',
      isModal: true,
      hasDropdown: false,
    },
    {
      name: 'CONTACT US',
      href: '/contact',
      hasDropdown: false,
    },
    {
      name: 'ABOUT US',
      href: '/about',
      hasDropdown: false,
    },
  ];

  const isTransparentHeader = isHomePage && !isScrolled;

  const headerContainerClass = isScrolled
    ? 'bg-[#0c0806]/95 backdrop-blur-2xl py-3 border-b border-[#CB9700]/30 shadow-2xl text-white'
    : isTransparentHeader
    ? 'bg-gradient-to-b from-black/85 via-black/40 to-transparent py-3.5 border-b border-transparent shadow-none text-white'
    : 'bg-[#0c0806] backdrop-blur-2xl py-3.5 border-b border-[#CB9700]/25 shadow-xl text-white';

  const iconColorClass = 'text-[#FAF6ED] hover:text-[#CB9700] transition-colors';

  const searchInputClass = isTransparentHeader
    ? 'bg-black/30 backdrop-blur-md border border-white/30 text-[#FAF6ED] placeholder-stone-300 focus:border-[#CB9700] focus:bg-black/60'
    : 'bg-[#1F1B18] border border-white/20 text-[#FAF6ED] placeholder-stone-400 focus:border-[#CB9700] focus:bg-[#28231F]';

  const navLinkColorClass = (isActive: boolean) =>
    isActive ? 'text-[#FAF6ED] font-bold drop-shadow-sm' : 'text-[#FAF6ED] hover:text-[#CB9700] font-bold drop-shadow-sm';

  const loginButtonClass = isTransparentHeader
    ? 'bg-black/30 backdrop-blur-md border border-[#CB9700]/50 hover:bg-[#CB9700] hover:text-black hover:border-[#CB9700] text-[#FAF6ED] font-sans font-medium text-xs sm:text-[13px] px-4 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95'
    : 'bg-[#1F1B18] border border-[#CB9700]/40 hover:bg-[#CB9700] hover:text-black hover:border-[#CB9700] text-[#FAF6ED] font-sans font-medium text-xs sm:text-[13px] px-4 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95';

  const dropdownPanelClass = 'bg-[#0c0806] backdrop-blur-2xl border-b border-[#CB9700]/30 text-white shadow-2xl';

  const dropdownCardClass = 'bg-white/5 border-white/10 text-white hover:border-[#CB9700]';

  return (
    <>
      {/* Dynamic Luxury Header matching Page Background */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${headerContainerClass}`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="max-w-[1480px] w-full mx-auto px-6 lg:px-12 flex flex-col space-y-3">
          {/* Top Row: Search (Left), Wordmark Logo (Center), Utilities & Login (Right) */}
          <div className="flex items-center justify-between">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden transition-colors p-2 ${iconColorClass}`}
              aria-label="Open Mobile Navigation"
            >
              <Menu className="w-6 h-6 stroke-[1.8]" />
            </button>

            {/* Left: CarbonSmith Style Interactive Search Bar */}
            <div className="hidden lg:flex items-center relative w-60 sm:w-72">
              <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute left-3 p-0.5 text-stone-400 hover:text-[#CB9700] transition-colors cursor-pointer z-10"
                >
                  <Search className="w-4 h-4 stroke-[1.8]" />
                </button>
                <input
                  type="text"
                  placeholder="Search confections..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-8 py-1.5 rounded border text-xs sm:text-[13px] font-normal focus:outline-none transition-all ${searchInputClass}`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="absolute right-2.5 text-stone-400 hover:text-white p-0.5 cursor-pointer z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Live Instant Search Dropdown Flyout */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim() !== '' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#141110] border border-[#CB9700]/40 rounded-2xl shadow-2xl overflow-hidden z-50 text-white p-3 space-y-2"
                  >
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 pt-1 flex justify-between items-center">
                      <span>Search Results ({searchResults.length})</span>
                      <button onClick={() => setIsSearchFocused(false)} className="hover:text-white cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-400">
                        No products found matching "{searchQuery}"
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                        {searchResults.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/products/${prod.slug}`}
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-colors group"
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0 border border-white/10">
                              <Image src={prod.images[0]} alt={prod.name} fill sizes="40px" className="object-cover" />
                            </div>
                            <div className="overflow-hidden flex-1">
                              <h5 className="text-xs font-semibold text-white group-hover:text-[#CB9700] truncate">
                                {prod.name}
                              </h5>
                              <span className="text-[10px] text-[#CB9700] font-bold">₹{prod.price.toLocaleString('en-IN')}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-2 bg-[#CB9700] hover:bg-[#d9a408] text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <span>View All Results for "{searchQuery}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Center: Enhanced Brand Logo */}
            <Link href="/" className="group flex items-center justify-center py-1">
              <div className="relative h-16 sm:h-20 md:h-24 w-56 sm:w-72 md:w-84">
                <Image
                  src="/Le-Damas-Sweets-Logo-enhanced.png"
                  alt="Le Damas Sweets Logo"
                  fill
                  priority
                  sizes="(max-width: 768px) 220px, 340px"
                  className="object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            {/* Right: Wishlist, Shopping Bag & Login Button (CarbonSmith Layout) */}
            <div className="flex items-center space-x-5 sm:space-x-6">
              {/* Wishlist Link Button */}
              <Link
                href="/wishlist"
                className="relative transition-all hidden sm:flex items-center justify-center p-1.5 rounded hover:bg-white/10"
                aria-label="View Wishlist"
                title="Wishlist"
              >
                <Heart className="w-[22px] h-[22px] text-[#E5E7EB] hover:text-white transition-colors stroke-[1.6]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#CB9700] text-[10px] font-bold text-black flex items-center justify-center font-sans shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Button */}
              <button
                id="cart-icon"
                onClick={openCart}
                className="relative transition-all p-1.5 rounded hover:bg-white/10 flex items-center justify-center"
                aria-label="Open Cart"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-[22px] h-[22px] text-[#E5E7EB] hover:text-white transition-colors stroke-[1.6]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#CB9700] text-[10px] font-bold text-black flex items-center justify-center font-sans shadow-md">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Auth User Badge / Login Button */}
              {isAuthenticated ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#CB9700]/60 bg-[#141110] hover:bg-[#CB9700]/20 text-[#FAF6ED] text-xs font-semibold transition-all shadow-md cursor-pointer group"
                  >
                    {/* Luxury User Badge Avatar */}
                    <div className="w-6 h-6 rounded-full bg-[#CB9700] text-black font-bold text-[11px] flex items-center justify-center uppercase shadow-inner flex-shrink-0">
                      {getUserInitial()}
                    </div>
                    <span className="font-medium tracking-wide whitespace-nowrap text-stone-200 group-hover:text-white">
                      {getHeaderDisplayName()}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#CB9700] flex-shrink-0" />
                  </button>

                  {/* CarbonSmith-Style Luxury Dropdown Menu */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-[#141110] border border-[#CB9700]/40 rounded-2xl shadow-2xl overflow-hidden z-50 text-white"
                      >
                        {/* Dropdown Header Box */}
                        <div className="p-4 border-b border-white/10 flex items-center space-x-3.5 bg-gradient-to-r from-white/5 to-transparent">
                          <div className="w-11 h-11 rounded-full bg-[#2B2522] border border-[#CB9700]/40 text-[#CB9700] font-bold text-lg flex items-center justify-center uppercase shadow-md flex-shrink-0">
                            {getUserInitial()}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate leading-snug">
                              {user?.name && !user.name.startsWith('Customer +') && !user.name.startsWith('Guest User')
                                ? user.name
                                : 'Luxury Connoisseur'}
                            </h4>
                            <p className="text-[11px] text-stone-400 truncate mt-0.5 font-mono">
                              {user?.phone && !user.phone.startsWith('google_')
                                ? `+91 ${user.phone.replace(/\D/g, '').slice(-10)}`
                                : user?.email || 'Logged In'}
                            </p>
                          </div>
                        </div>

                        {/* Menu Options List */}
                        <div className="p-2 space-y-0.5">
                          <Link
                            href="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-stone-200 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <User className="w-4 h-4 text-[#CB9700]" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            href="/profile/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-stone-200 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Package className="w-4 h-4 text-[#CB9700]" />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-stone-200 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Heart className="w-4 h-4 text-[#CB9700]" />
                            <span>Wishlist ({wishlistCount})</span>
                          </Link>

                          <div className="pt-1 border-t border-white/10 mt-1">
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false);
                                logout();
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left cursor-pointer"
                            >
                              <LogOut className="w-4 h-4 text-rose-400" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className={`hidden sm:inline-flex items-center transition-all ${loginButtonClass}`}
                >
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-Navigation Links Row */}
          <nav className="hidden lg:flex items-center justify-center space-x-9 pt-2.5 border-t border-white/10 relative">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || activeDropdown === link.id;
              return (
                <div
                  key={link.name}
                  className="relative py-1"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.id || null)}
                >
                  {link.isModal ? (
                    <button
                      onClick={() => setBulkModalOpen(true)}
                      className={`text-xs sm:text-[12.5px] font-sans tracking-[0.18em] font-bold uppercase transition-colors flex items-center space-x-1 py-1 ${navLinkColorClass(false)}`}
                    >
                      <span>{link.name}</span>
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={`text-xs sm:text-[12.5px] font-sans tracking-[0.18em] font-bold uppercase transition-colors flex items-center space-x-1 py-1 ${navLinkColorClass(isActive)}`}
                    >
                      <span>{link.name}</span>
                      {link.hasDropdown && (
                        <motion.div
                          animate={{ rotate: activeDropdown === link.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-[#CB9700] stroke-[2.5]" />
                        </motion.div>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Mega Menu Dropdown Flyout Panel */}
        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`absolute top-full left-0 right-0 z-50 overflow-hidden ${dropdownPanelClass}`}
              onMouseEnter={() => setActiveDropdown(activeDropdown)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="max-w-[1480px] w-full mx-auto px-6 lg:px-12 py-8">
                {activeDropdown === 'trending' ? (
                  /* Full-width Trending Chocolates Dropdown Panel */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="font-serif text-lg text-[#CB9700] tracking-wider uppercase font-semibold">
                        Trending Chocolates
                      </h4>
                      <Link href="/trending" className="text-xs font-sans text-[#CB9700] hover:underline uppercase tracking-wider font-semibold flex items-center gap-1">
                        <span>View All Trending &rarr;</span>
                      </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                      {PRODUCTS.filter((p) => p.isBestSeller || p.isFeatured).slice(0, 4).map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className={`group p-3.5 rounded-xl border transition-all shadow-xs text-left flex flex-col justify-between ${dropdownCardClass}`}
                        >
                          <div className="relative aspect-square w-full mb-2.5 overflow-hidden rounded-lg bg-stone-100">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="220px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <h5 className="text-xs font-serif font-semibold line-clamp-1 group-hover:text-[#CB9700] text-white">
                              {product.name}
                            </h5>
                            <span className="text-[10px] font-sans text-stone-400 font-light uppercase tracking-wider">
                              {product.category}
                            </span>
                            <p className="text-xs font-sans text-[#CB9700] font-bold mt-1">
                              ₹{product.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Collections Dropdown Panel */
                  <div className="grid grid-cols-12 gap-8">
                    {/* Column 1: Featured Categories */}
                    <div className="col-span-3 space-y-4 border-r border-white/10 pr-6">
                      <h4 className="font-serif text-lg text-[#CB9700] tracking-wider uppercase font-semibold">
                        Our Signature Collections
                      </h4>
                      <ul className="space-y-1 text-xs font-sans text-stone-300">
                        {collectionCategories.map((cat) => {
                          const isHovered = hoveredCollectionKey === cat.key;
                          return (
                            <li key={cat.key}>
                              <Link
                                href={cat.href}
                                onMouseEnter={() => setHoveredCollectionKey(cat.key)}
                                className={`flex items-center justify-between transition-all duration-200 py-1.5 px-3 rounded-xl cursor-pointer ${
                                  isHovered
                                    ? 'text-[#CB9700] bg-white/10 font-bold translate-x-1 shadow-xs'
                                    : 'hover:text-[#CB9700] hover:bg-white/5'
                                }`}
                              >
                                <span>{cat.name}</span>
                                <ChevronRight className={`w-3.5 h-3.5 transition-all ${isHovered ? 'text-[#CB9700] translate-x-0.5 opacity-100' : 'text-stone-500 opacity-50'}`} />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Column 2: Visual Featured Product Cards */}
                    <div className="col-span-9 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-sans font-semibold tracking-widest uppercase text-stone-300">
                            Featured Delicacies
                          </span>
                          <span className="text-xs font-serif text-[#CB9700] font-normal italic">
                            &mdash; {activeCollectionCategory.name}
                          </span>
                        </div>
                        <Link href={activeCollectionCategory.href} className="text-[11px] font-sans text-[#CB9700] hover:underline uppercase tracking-wider font-semibold">
                          View Collection &rarr;
                        </Link>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        {dropdownFeaturedProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className={`group p-3 rounded-xl border transition-all shadow-xs text-left flex flex-col justify-between hover:border-[#CB9700] hover:scale-[1.02] duration-300 ${dropdownCardClass}`}
                          >
                            <div className="relative aspect-square w-full mb-2 overflow-hidden rounded-lg bg-stone-100">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="180px"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div>
                              <h5 className="text-[11px] font-serif font-semibold line-clamp-2 group-hover:text-[#CB9700] text-white transition-colors">
                                {product.name}
                              </h5>
                              <p className="text-[10px] font-sans text-[#CB9700] font-bold mt-1">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Mobile Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 w-4/5 max-w-sm h-full bg-[#141110] border-r border-white/10 p-6 flex flex-col justify-between overflow-y-auto text-white"
            >
              <div className="space-y-6">
                {/* Header Top: Logo & Close Button */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="relative h-14 w-48">
                    <Image
                      src="/Le-Damas-Sweets-Logo-enhanced.png"
                      alt="Le Damas Sweets Logo"
                      fill
                      sizes="192px"
                      className="object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-stone-400 hover:text-white transition-colors"
                    aria-label="Close mobile menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <button type="submit" aria-label="Search" className="absolute left-3.5 top-2.5 text-stone-400 hover:text-[#CB9700] transition-colors">
                    <Search className="w-4 h-4 stroke-[1.8]" />
                  </button>
                  <input
                    type="text"
                    placeholder="Search confections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#CB9700]"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </form>

                {/* Navigation Links */}
                <nav className="space-y-3 pt-2">
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left py-2.5 px-3 text-sm font-sans tracking-widest font-semibold text-[#2AD2C5] uppercase flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-[#2AD2C5]" />
                      <span>MY WISHLIST ({wishlistCount})</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#2AD2C5]" />
                  </Link>

                  {navLinks.map((link) => (
                    <div key={link.name}>
                      {link.isModal ? (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setBulkModalOpen(true);
                          }}
                          className="w-full text-left py-2.5 px-3 text-sm font-sans tracking-widest font-semibold text-stone-200 hover:text-[#2AD2C5] uppercase flex items-center justify-between rounded-lg hover:bg-white/5 transition-all"
                        >
                          <span>{link.name}</span>
                          <ChevronRight className="w-4 h-4 text-[#CB9700]" />
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full text-left py-2.5 px-3 text-sm font-sans tracking-widest font-semibold text-stone-200 hover:text-[#2AD2C5] uppercase flex items-center justify-between rounded-lg hover:bg-white/5 transition-all"
                        >
                          <span>{link.name}</span>
                          <ChevronRight className="w-4 h-4 text-stone-500" />
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Mobile Drawer Bottom: Login / Account Button */}
              <div className="pt-6 border-t border-white/10 space-y-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {/* Clickable Profile Card */}
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3.5 rounded-xl bg-gradient-to-r from-white/10 to-white/5 hover:from-[#CB9700]/20 hover:to-[#CB9700]/10 border border-[#CB9700]/40 transition-all flex items-center justify-between group shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-full bg-[#CB9700] text-black font-bold text-sm flex items-center justify-center uppercase shrink-0 shadow-md">
                          {user?.name ? user.name.charAt(0) : 'L'}
                        </div>
                        <div className="overflow-hidden text-left">
                          <div className="text-xs font-bold text-white group-hover:text-[#CB9700] transition-colors truncate">
                            {user?.name || 'Luxury Connoisseur'}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            {user?.email || (user?.phone ? `+91 ${user.phone.replace(/\D/g, '').slice(-10)}` : 'View Profile & Orders')}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#CB9700] group-hover:translate-x-1 transition-transform shrink-0" />
                    </Link>

                    {/* Quick Access Buttons: My Orders & My Account */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/profile/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 hover:text-white font-sans text-xs font-medium transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Package className="w-3.5 h-3.5 text-[#CB9700]" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 hover:text-white font-sans text-xs font-medium transition-all flex items-center justify-center space-x-1.5"
                      >
                        <User className="w-3.5 h-3.5 text-[#CB9700]" />
                        <span>My Account</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-sans text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center space-x-2 border border-rose-500/20 cursor-pointer mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLoginModal();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-[#CB9700] hover:text-black border border-white/20 text-white font-sans text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4 text-[#CB9700]" />
                    <span>Login / Register</span>
                  </button>
                )}
                <p className="text-[10px] text-center text-stone-500 tracking-wider">
                  Handcrafted Luxury Confections &bull; Since 1951
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Bulk Order Enquiry Modal */}
      <BulkOrderModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />

      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
