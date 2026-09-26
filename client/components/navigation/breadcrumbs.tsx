import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { JsonLd } from '../seo/json-ld';
import { generateBreadcrumbJsonLd, BreadcrumbItem } from '../../lib/structured-data';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLdData = generateBreadcrumbJsonLd(items);

  return (
    <>
      <JsonLd data={jsonLdData} />
      <nav aria-label="Breadcrumb" className="py-4">
        <ol className="flex items-center space-x-2 text-xs text-[#a89a8e] font-sans tracking-wide">
          <li>
            <Link
              href="/"
              className="flex items-center hover:text-[#d5b268] transition-colors focus:outline-none focus:ring-1 focus:ring-[#d5b268] rounded px-1"
            >
              <Home className="w-3.5 h-3.5 mr-1" />
              <span>Home</span>
            </Link>
          </li>
          {items.map((crumb, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={crumb.item} className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#736558] flex-shrink-0" />
                {isLast ? (
                  <span
                    className="text-[#d5b268] font-medium truncate max-w-[200px] sm:max-w-[300px]"
                    aria-current="page"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.item}
                    className="hover:text-[#d5b268] transition-colors focus:outline-none focus:ring-1 focus:ring-[#d5b268] rounded px-1 truncate max-w-[150px] sm:max-w-[200px]"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
