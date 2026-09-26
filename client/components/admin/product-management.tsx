'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  X,
  Sliders,
  Globe,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Archive,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/products';
import { Product } from '@/lib/types';
import { getProductsFromDb } from '@/lib/services/product-service';

export type ProductStatus = 'Active' | 'Draft' | 'Archived';

export interface AdminProductExtended extends Product {
  status: ProductStatus;
  stockQuantity: number;
  skuCode: string;
  tags: string[];
}

const INITIAL_PRODUCTS_EXTENDED: AdminProductExtended[] = PRODUCTS.map((p: any, idx: number) => {
  const catName = typeof p.category === 'object' && p.category !== null ? p.category.name : String(p.category || 'Kunafa Chocolate');
  return {
    ...p,
    category: catName,
    status: 'Active',
    stockQuantity: 150 + idx * 25,
    skuCode: `LD-SKU-${1000 + idx}`,
    tags: [catName, p.primaryKeyword || 'Artisanal Bar'],
  };
});

export const ProductManagement: React.FC = () => {
  const [productList, setProductList] = useState<AdminProductExtended[]>(INITIAL_PRODUCTS_EXTENDED);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductExtended | null>(null);

  useEffect(() => {
    async function loadDynamicProducts() {
      try {
        const dbProducts = await getProductsFromDb();
        if (dbProducts && dbProducts.length > 0) {
          const mapped: AdminProductExtended[] = dbProducts.map((p: any, idx: number) => {
            const catName = typeof p.category === 'object' && p.category !== null
              ? p.category.name
              : typeof p.categoryName === 'string'
              ? p.categoryName
              : typeof p.category === 'string'
              ? p.category
              : 'Kunafa Chocolate';

            return {
              ...p,
              category: catName,
              categorySlug: typeof p.category === 'object' && p.category !== null ? p.category.slug : (p.categorySlug || 'kunafa-chocolate'),
              status: 'Active',
              stockQuantity: p.stockQuantity || 150 + idx * 25,
              skuCode: p.skuCode || `LD-SKU-${1000 + idx}`,
              tags: Array.isArray(p.tags) && p.tags.length > 0 && typeof p.tags[0] === 'string'
                ? p.tags
                : [catName, p.primaryKeyword || 'Artisanal Bar'],
            };
          });
          setProductList(mapped);
        }
      } catch (err) {
        console.error('[DYNAMIC PRODUCTS FETCH ERROR]', err);
      }
    }
    loadDynamicProducts();
  }, []);

  // Form State
  const [formData, setFormData] = useState<Partial<AdminProductExtended>>({
    name: '',
    category: 'Kunafa Chocolate',
    price: 1699,
    compareAtPrice: 1899,
    weight: '200gm',
    stockQuantity: 200,
    skuCode: 'LD-SKU-1099',
    status: 'Active',
    inStock: true,
    shortDescription: '',
    description: '',
    tags: ['Handcrafted', 'Kunafa'],
    images: ['/Kunafa Pistachio Dark Chocolate 1.png'],
    seoTitle: '',
    metaDescription: '',
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  const filteredProducts = productList.filter((prod: any) => {
    const catName = typeof prod.category === 'object' && prod.category !== null ? prod.category.name : String(prod.category || '');
    const skuStr = typeof prod.skuCode === 'string' ? prod.skuCode : String(prod.skuCode || '');
    const nameStr = typeof prod.name === 'string' ? prod.name : String(prod.name || '');

    const matchesQuery =
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skuStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || catName === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || prod.status === statusFilter;
    return matchesQuery && matchesCat && matchesStatus;
  });

  const categoriesList = Array.from(
    new Set(
      productList.map((p: any) =>
        typeof p.category === 'object' && p.category !== null ? p.category.name : String(p.category || 'Kunafa Chocolate')
      )
    )
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Kunafa Chocolate',
      price: 1699,
      compareAtPrice: 1899,
      weight: '200gm',
      stockQuantity: 200,
      skuCode: `LD-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Active',
      inStock: true,
      shortDescription: '',
      description: '',
      tags: ['Handcrafted', 'Kunafa'],
      images: ['/Kunafa Pistachio Dark Chocolate 1.png'],
      seoTitle: '',
      metaDescription: '',
    });
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: AdminProductExtended) => {
    setEditingProduct(prod);
    setFormData(prod);
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this SKU from the catalog?')) {
      setProductList(productList.filter((p) => p.id !== id));
    }
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    const updatedImages = [...(formData.images || []), imageUrlInput.trim()];
    setFormData({ ...formData, images: updatedImages });
    setImageUrlInput('');
  };

  const handleRemoveImage = (imgIdx: number) => {
    const updatedImages = (formData.images || []).filter((_, idx) => idx !== imgIdx);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const price = Number(formData.price);
    const compareAtPrice = formData.compareAtPrice ? Number(formData.compareAtPrice) : price;

    if (editingProduct) {
      setProductList(
        productList.map((p) =>
          p.id === editingProduct.id
            ? ({
                ...p,
                ...formData,
                price,
                compareAtPrice,
                originalPrice: compareAtPrice,
                slug,
                seoTitle: formData.seoTitle || `${formData.name} | LE DAMAS`,
              } as AdminProductExtended)
            : p
        )
      );
    } else {
      const newProd: AdminProductExtended = {
        id: `sku-custom-${Date.now()}`,
        slug,
        name: formData.name || 'New Chocolate Bar',
        tagline: formData.tagline || 'Artisanal Confection',
        shortDescription: formData.shortDescription || 'Luxury chocolate bar by LE DAMAS.',
        description: formData.description || 'Luxury chocolate bar by LE DAMAS.',
        brand: 'LE DAMAS',
        category: formData.category || 'Kunafa Chocolate',
        categorySlug: 'kunafa-chocolate',
        images: formData.images && formData.images.length > 0 ? formData.images : ['/Kunafa Pistachio Dark Chocolate 1.png'],
        weight: formData.weight || '200gm',
        origin: 'Single-Origin Cocoa',
        price,
        compareAtPrice,
        originalPrice: compareAtPrice,
        currency: 'INR',
        availability: 'InStock',
        inStock: formData.inStock ?? true,
        isFeatured: true,
        dietaryBadges: ['Handcrafted', 'Artisanal Batch'],
        tastingNotes: ['Rich Cocoa', 'Toasted Nuts'],
        seoTitle: formData.seoTitle || `${formData.name} | LE DAMAS`,
        metaDescription: formData.metaDescription || `Buy ${formData.name} online from LE DAMAS.`,
        primaryKeyword: formData.name.toLowerCase(),
        secondaryKeywords: [(formData.category || 'Kunafa Chocolate').toLowerCase()],
        imageAlt: formData.name,
        status: formData.status || 'Active',
        stockQuantity: formData.stockQuantity || 100,
        skuCode: formData.skuCode || `LD-SKU-${Date.now()}`,
        tags: formData.tags || ['Artisanal'],
      };
      setProductList([newProd, ...productList]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStock = (id: string) => {
    setProductList(
      productList.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            📦 Product Management & SKU Editor
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Full product photo management, multi-images, pricing, discount %, SKUs, stock quantities, tags, and status (Active/Draft/Archived).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-black border border-stone-300 font-sans text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#CB9700]" />
            <span>Excel Bulk Upload</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-black hover:bg-stone-800 text-white font-sans text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#CB9700]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU code, name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs text-black pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-black"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-stone-600 font-sans font-semibold">Status:</span>
          {(['ALL', 'Active', 'Draft', 'Archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-black text-white'
                  : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Product Datatable */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-sans text-stone-600 uppercase tracking-wider bg-stone-100">
                <th className="py-4 px-4 font-mono">SKU Code</th>
                <th className="py-4 px-4">Product & Images</th>
                <th className="py-4 px-4 font-mono">Price & Discount</th>
                <th className="py-4 px-4 font-mono">Stock Qty</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm font-sans">
              {filteredProducts.map((product) => {
                const discountPct = product.compareAtPrice
                  ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                  : 0;

                return (
                  <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-black text-xs">
                      {product.skuCode}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2 shrink-0">
                          {product.images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border-2 border-white bg-stone-100 shadow-xs"
                            />
                          ))}
                        </div>
                        <div>
                          <p className="font-semibold text-black font-serif text-base">{product.name}</p>
                          <p className="text-xs text-stone-500">{product.category} • {product.weight}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-black text-base">₹{product.price}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-xs text-stone-400 line-through">
                            ₹{product.compareAtPrice}
                          </span>
                        )}
                      </div>
                      {discountPct > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {discountPct}% OFF
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-black">
                      {product.stockQuantity} units
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                          product.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : product.status === 'Draft'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-200 text-stone-700 border border-stone-400'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-black transition-colors cursor-pointer border border-stone-300"
                          title="Edit Photos & Product Data"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer border border-rose-200"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2">
                <Package className="w-5 h-5 text-[#CB9700]" />
                {editingProduct ? 'Edit Product & Images' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-500 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Product Photos Section */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <label className="type-label text-xs font-sans text-black block font-bold flex items-center gap-1">
                  <ImageIcon className="w-4 h-4 text-[#CB9700]" /> Product Images (Multiple Photo Upload)
                </label>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter image URL or asset path..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-white text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold shrink-0"
                  >
                    Add Photo
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {(formData.images || []).map((img, imgIdx) => (
                    <div key={imgIdx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-stone-300 bg-white">
                      <img src={img} alt="Product" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imgIdx)}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-xs opacity-90 hover:opacity-100"
                        title="Delete photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="type-label text-stone-700 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter title"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="type-label text-stone-700 block mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="LD-SKU-1001"
                    value={formData.skuCode || ''}
                    onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="type-label text-stone-700 block mb-1">Product Status *</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  >
                    <option value="Active">Active (Visible)</option>
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="type-label text-stone-700 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1799"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="type-label text-stone-700 block mb-1">Compare-at Price (₹)</label>
                  <input
                    type="number"
                    placeholder="1999"
                    value={formData.compareAtPrice || ''}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="type-label text-stone-700 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={formData.stockQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="type-label text-stone-700 block mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Short summary tagline..."
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="type-label text-stone-700 block mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed ingredients and taste profile..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-black text-white font-bold text-xs"
                >
                  Save Product Data & Photos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
