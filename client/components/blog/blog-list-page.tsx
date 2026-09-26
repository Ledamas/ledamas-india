'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
  featured?: boolean;
}

const posts: BlogPost[] = [
  {
    slug: 'art-of-conching',
    title: 'The 72-hour secret: why we conch our chocolate for three days',
    excerpt:
      'Conching is the slow, patient step most brands rush. Here is why we never do — and what it actually does to flavor and texture.',
    category: 'Craft',
    date: 'Aug 14, 2026',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1200&auto=format&fit=crop',
    featured: true,
  },
  {
    slug: 'kunafa-origins',
    title: 'From Damascus to Dubai: the story behind our kunafa chocolate',
    excerpt: 'How a centuries-old Middle Eastern dessert found its way into a chocolate bar.',
    category: 'Heritage',
    date: 'Jul 30, 2026',
    readTime: '4 min read',
    coverImage: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200&auto=format&fit=crop',
  },
  {
    slug: 'pistachio-sourcing',
    title: 'Where our pistachios come from, and why it matters',
    excerpt: 'A look at the farms and the harvest season behind our signature pistachio crème.',
    category: 'Ingredients',
    date: 'Jul 12, 2026',
    readTime: '5 min read',
    coverImage: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1200&auto=format&fit=crop',
  },
  {
    slug: 'pairing-guide',
    title: 'A pairing guide: what to drink with dark, milk, and white chocolate',
    excerpt: 'Coffee, wine, or tea — here is how to match each of our collections.',
    category: 'Guides',
    date: 'Jun 28, 2026',
    readTime: '7 min read',
    coverImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1200&auto=format&fit=crop',
  },
];

export function BlogListPage() {
  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-[#0F0D0C] text-white py-16 px-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xs tracking-[0.2em] text-[#2AD2C5] mb-3 uppercase font-medium">Journal</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-wide">Stories from the kitchen</h1>
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white/5 border border-white/10">
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 text-xs text-stone-400 mb-3">
                  <span className="text-[#CB9700] font-semibold uppercase tracking-wider">{featured.category}</span>
                  <span>·</span>
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.readTime}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl mb-3 leading-snug group-hover:text-[#2AD2C5] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm text-stone-400 leading-relaxed font-light">{featured.excerpt}</p>
              </div>
            </div>
          </Link>
        )}

        {/* Grid of remaining posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-white/10 pt-12">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-4">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-2">
                <span className="text-[#CB9700] font-medium uppercase tracking-wider">{post.category}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="font-serif text-lg leading-snug group-hover:text-[#2AD2C5] transition-colors">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
