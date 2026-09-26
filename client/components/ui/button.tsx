import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-sans tracking-[0.15em] text-xs uppercase transition-all duration-300 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none relative overflow-hidden group';

  const variantStyles = {
    primary:
      'bg-[#fbf9f5] text-[#120b08] hover:bg-[#d5b268] hover:text-[#0c0806] border border-transparent shadow-lg',
    secondary:
      'bg-[#1c1410] text-[#fbf9f5] hover:bg-[#281d17] border border-[#d5b268]/20 hover:border-[#d5b268]/50',
    outline:
      'bg-transparent text-[#fbf9f5] border border-[#d5b268]/40 hover:border-[#d5b268] hover:bg-[#d5b268]/10 text-[#d5b268]',
    gold:
      'bg-gradient-to-r from-[#d5b268] to-[#c5a059] text-[#0c0806] font-medium hover:from-[#e5c57b] hover:to-[#d5b268] shadow-md hover:shadow-[#d5b268]/20',
    ghost:
      'bg-transparent text-[#a89a8e] hover:text-[#fbf9f5] hover:bg-[#1c1410]/50'
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-7 py-3 text-xs',
    lg: 'px-10 py-4 text-xs tracking-[0.2em]'
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
