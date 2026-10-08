'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Flame } from 'lucide-react';
import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { isAuthenticated, openLoginModal } = useAuth();

  if (pathname.startsWith('/checkout') || pathname.startsWith('/admin') || pathname === '/search') {
    return null;
  }

  const checkIsActive = (href?: string) => {
    if (!href) return false;
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  };

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
    },
    {
      name: 'Trending',
      href: '/trending',
      icon: Flame,
    },
    {
      name: 'Cart',
      onClick: openCart,
      icon: ShoppingBag,
      badge: totalItems > 0 ? totalItems : null,
    },
    {
      name: 'Profile',
      href: isAuthenticated ? '/profile' : `/login?callbackUrl=${encodeURIComponent(pathname)}`,
      icon: User,
    },
  ];

  // We want to ensure only ONE tab is highlighted.
  // Because /collections might overlap, we find the first match from most specific to least.
  let activeIndex = -1;
  for (let i = navItems.length - 1; i >= 0; i--) {
    if (checkIsActive(navItems[i].href)) {
      activeIndex = i;
      break;
    }
  }

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40" 
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[64px] px-1">
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.icon;

          const content = (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div 
                className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-[#CB9700]/15' : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-[26px] h-[26px] transition-colors ${
                    isActive ? 'text-[#CB9700]' : 'text-stone-700'
                  }`}
                  strokeWidth={isActive ? 2.25 : 2}
                />
                {item.badge !== undefined && item.badge !== null && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C5114F] text-white text-[10px] font-bold h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[12px] whitespace-nowrap mt-1 leading-none transition-colors tracking-wide ${
                  isActive ? 'font-bold text-[#CB9700]' : 'font-medium text-stone-700'
                }`}
              >
                {item.name}
              </span>
            </div>
          );

          const wrapperClass = "flex flex-col items-center justify-center flex-1 h-16 outline-none touch-manipulation active:opacity-70 [-webkit-tap-highlight-color:transparent]";

          if (item.href && !item.onClick) {
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={wrapperClass}
                aria-current={isActive ? 'page' : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.name}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
              className={wrapperClass}
              aria-current={isActive ? 'page' : undefined}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
