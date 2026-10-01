import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  subtitle?: string;
  eyebrow?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  goldAccent?: boolean;
}

export function Heading({
  as: Component = 'h2',
  children,
  subtitle,
  eyebrow,
  align = 'left',
  className,
  goldAccent = false
}: HeadingProps) {
  const alignment = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  const sizes = {
    h1: 'text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05]',
    h2: 'text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]',
    h3: 'text-2xl md:text-3xl lg:text-4xl font-normal leading-[1.15]',
    h4: 'text-xl md:text-2xl font-normal leading-snug',
    h5: 'text-lg md:text-xl font-normal',
    h6: 'text-base font-medium',
  };

  return (
    <div className={twMerge(clsx('space-y-3', alignment[align], className))}>
      {eyebrow && (
        <span className="block text-[10px] md:text-xs font-sans uppercase tracking-[0.25em] text-[#d5b268] font-medium">
          {eyebrow}
        </span>
      )}
      <Component className={twMerge(clsx('font-serif', sizes[Component], goldAccent && 'text-gold-gradient'))}>
        {children}
      </Component>
      {subtitle && (
        <p className="text-xs md:text-sm text-[#a89a8e] font-sans font-light tracking-wide max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
