import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'dark' | 'outline' | 'taupe';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'gold',
  size = 'sm',
  className
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-sans tracking-[0.15em] uppercase font-medium rounded-full';

  const variantStyles = {
    gold: 'bg-[#d5b268]/15 text-[#d5b268] border border-[#d5b268]/30',
    dark: 'bg-[#1c1410] text-[#a89a8e] border border-[#a89a8e]/20',
    outline: 'bg-transparent text-[#fbf9f5] border border-[#fbf9f5]/25',
    taupe: 'bg-[#2a1e17] text-[#c5a059] border border-[#c5a059]/20'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-[9px]',
    md: 'px-3.5 py-1 text-[10px]'
  };

  return (
    <span className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}>
      {children}
    </span>
  );
}
