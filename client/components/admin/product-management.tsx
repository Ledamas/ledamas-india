'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  X,
  Globe,
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Sparkles,
  Save,
  Loader2,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { getProductsFromDb } from '@/lib/services/product-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type ProductStatus = 'Active' | 'Draft' | 'OutOfStock' | 'Archived';

export interface AdminProductExtended extends Product {
  status: ProductStatus;
  stockQuantity: number;
  skuCode: string;
  tags: string[];
  features?: string[];
  subcategory?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    openGraphTitle?: string;
    openGraphDescription?: string;
    openGraphImage?: string;
  };
}

export const ProductManagement: React.FC = () => {
  const [productList, setProductList] = useState<AdminProductExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductExtended | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'info' | 'pricing' | 'inventory' | 'media' | 'seo' | 'status'>('info');

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    slug: string;
    tagline: string;
    categorySlug: string;
    subcategory: string;
    shortDescription: string;
    description: string;
    featuresInput: string;
    ingredientsInput: string;
    tagsInput: string;
    price: number;
    compareAtPrice: number;
    skuCode: string;
    stockQuantity: number;
    weight: string;
    status: ProductStatus;
    inStock: boolean;
    isFeatured: boolean;
    isBestSeller: boolean;
    isNewRelease: boolean;
    mainImage: string;
    galleryImages: string[];
    metaTitle: string;
    metaDescription: string;
    keywordsInput: string;
    canonicalUrl: string;
    openGraphTitle: string;
    openGraphDescription: string;
    openGraphImage: string;
  }>({
    name: '',
    slug: '',
    tagline: 'Luxury Artisanal Chocolate',
    categorySlug: 'kunafa-chocolate',
    subcategory: '',
    shortDescription: '',
    description: '',
    featuresInput: '',
    ingredientsInput: '',
    tagsInput: 'Handcrafted, Kunafa',
    price: 1699,
    compareAtPrice: 1899,
    skuCode: 'LD-SKU-1001',
    stockQuantity: 150,
    weight: '200gm',
    status: 'Active',
    inStock: true,
    isFeatured: false,
    isBestSeller: false,
    isNewRelease: false,
    mainImage: '/Kunafa Pistachio Dark Chocolate 1.png',
    galleryImages: [],
    metaTitle: '',
    metaDescription: '',
    keywordsInput: '',
    canonicalUrl: '',
    openGraphTitle: '',
    openGraphDescription: '',
    openGraphImage: '',
  });

  const [newImageInput, setNewImageInput] = useState('');

  // Fetch Products from Neon PostgreSQL DB
  const loadProducts = async () => {
    setLoading(true);
    try {
      const dbProducts = await getProductsFromDb();
      if (dbProducts) {
        const mapped: AdminProductExtended[] = dbProducts.map((p: any, idx: number) => {
          const catSlug = typeof p.category === 'object' && p.category !== null ? p.category.slug : (p.categorySlug || 'kunafa-chocolate');
          return {
            ...p,
            categorySlug: catSlug,
            status: (p.status || (p.inStock ? 'Active' : 'OutOfStock')) as ProductStatus,
            stockQuantity: p.stockQuantity ?? 150,
            skuCode: p.skuCode || `LD-SKU-${1000 + idx}`,
            tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Handcrafted'],
            features: Array.isArray(p.features) ? p.features : [],
            ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
            seo: p.seo || {},
          };
        });
        setProductList(mapped);
      }
    } catch (err) {
      console.error('[LOAD PRODUCTS ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = productList.filter((prod) => {
    const skuStr = prod.skuCode || '';
    const nameStr = prod.name || '';
    const catStr = prod.categorySlug || '';

    const matchesQuery =
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skuStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || catStr === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || prod.status === statusFilter;
    return matchesQuery && matchesCat && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      tagline: 'Luxury Artisanal Chocolate',
      categorySlug: 'kunafa-chocolate',
      subcategory: '',
      shortDescription: '',
      description: '',
      featuresInput: 'Belgian Cacao, Pure Cocoa Butter, Artisanal Batch',
      ingredientsInput: 'Cocoa Butter, Roasted Pistachios, Kataifi Pastry, Sugar, Milk Solids',
      tagsInput: 'Kunafa, Pistachio, Handcrafted',
      price: 1699,
      compareAtPrice: 1899,
      skuCode: `LD-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stockQuantity: 150,
      weight: '200gm',
      status: 'Active',
      inStock: true,
      isFeatured: false,
      isBestSeller: false,
      isNewRelease: false,
      mainImage: '/Kunafa Pistachio Dark Chocolate 1.png',
      galleryImages: [],
      metaTitle: '',
      metaDescription: '',
      keywordsInput: '',
      canonicalUrl: '',
      openGraphTitle: '',
      openGraphDescription: '',
      openGraphImage: '',
    });
    setActiveFormTab('info');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: AdminProductExtended) => {
    setEditingProduct(prod);
    setFormData({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      tagline: prod.tagline || '',
      categorySlug: prod.categorySlug || 'kunafa-chocolate',
      subcategory: prod.subcategory || '',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      featuresInput: (prod.features || []).join(', '),
      ingredientsInput: (prod.ingredients || []).join(', '),
      tagsInput: (prod.tags || []).join(', '),
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || prod.originalPrice || prod.price,
      skuCode: prod.skuCode || `LD-SKU-1001`,
      stockQuantity: prod.stockQuantity ?? 150,
      weight: prod.weight || '200gm',
      status: prod.status || 'Active',
      inStock: prod.inStock ?? true,
      isFeatured: prod.isFeatured ?? false,
      isBestSeller: prod.isBestSeller ?? false,
      isNewRelease: prod.isNewRelease ?? false,
      mainImage: prod.images?.[0] || '/Kunafa Pistachio Dark Chocolate 1.png',
      galleryImages: prod.images?.slice(1) || [],
      metaTitle: prod.seo?.metaTitle || `${prod.name} | LE DAMAS`,
      metaDescription: prod.seo?.metaDescription || prod.shortDescription || prod.description,
      keywordsInput: (prod.seo?.keywords || prod.tags || []).join(', '),
      canonicalUrl: prod.seo?.canonicalUrl || `https://ledamas.in/products/${prod.slug}`,
      openGraphTitle: prod.seo?.openGraphTitle || prod.name,
      openGraphDescription: prod.seo?.openGraphDescription || prod.shortDescription || prod.description,
      openGraphImage: prod.seo?.openGraphImage || prod.images?.[0] || '',
    });
    setActiveFormTab('info');
    setIsModalOpen(true);
  };

  // Save Product to Neon PostgreSQL DB via API
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || formData.price <= 0) {
      setAlertMsg({ type: 'error', text: 'Product name and a valid positive price are required.' });
      return;
    }

    setSaving(true);
    setAlertMsg(null);

    const generatedSlug = (formData.slug || formData.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const imagesList = [formData.mainImage, ...formData.galleryImages].filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      slug: generatedSlug,
      tagline: formData.tagline.trim(),
      categorySlug: formData.categorySlug,
      subcategory: formData.subcategory.trim(),
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      compareAtPrice: Number(formData.compareAtPrice),
      originalPrice: Number(formData.compareAtPrice),
      weight: formData.weight.trim(),
      skuCode: formData.skuCode.trim(),
      stockQuantity: Number(formData.stockQuantity),
      status: formData.status,
      inStock: formData.inStock,
      isFeatured: formData.isFeatured,
      isBestSeller: formData.isBestSeller,
      isNewRelease: formData.isNewRelease,
      features: formData.featuresInput.split(',').map((s) => s.trim()).filter(Boolean),
      ingredients: formData.ingredientsInput.split(',').map((s) => s.trim()).filter(Boolean),
      tags: formData.tagsInput.split(',').map((s) => s.trim()).filter(Boolean),
      images: imagesList.length > 0 ? imagesList : ['/Kunafa Pistachio Dark Chocolate 1.png'],
      seo: {
        metaTitle: formData.metaTitle || `${formData.name} | LE DAMAS`,
        metaDescription: formData.metaDescription || formData.shortDescription || formData.description,
        keywords: formData.keywordsInput.split(',').map((s) => s.trim()).filter(Boolean),
        canonicalUrl: formData.canonicalUrl || `https://ledamas.in/products/${generatedSlug}`,
        openGraphTitle: formData.openGraphTitle || formData.name,
        openGraphDescription: formData.openGraphDescription || formData.shortDescription || formData.description,
        openGraphImage: formData.openGraphImage || imagesList[0] || '',
      },
    };

    try {
      const isEdit = Boolean(editingProduct?.id);
      const url = isEdit ? `${API_BASE_URL}/api/v1/products/${editingProduct!.id}` : `${API_BASE_URL}/api/v1/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': 'true',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setAlertMsg({ type: 'success', text: `Product '${formData.name}' saved permanently to database!` });
        setIsModalOpen(false);
        await loadProducts();
      } else {
        setAlertMsg({ type: 'error', text: json.message || 'Failed to save product in database.' });
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Error connecting to database API.' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (prod: AdminProductExtended) => {
    const nextStatus = prod.status === 'Active' ? 'OutOfStock' : 'Active';
    const nextInStock = nextStatus === 'Active';

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products/${prod.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': 'true',
        },
        body: JSON.stringify({ status: nextStatus, inStock: nextInStock }),
      });

      if (res.ok) {
        setAlertMsg({ type: 'success', text: `Status updated for ${prod.name}` });
        await loadProducts();
      }
    } catch (err) {
      console.error('[STATUS TOGGLE ERROR]', err);
    }
  };

  // Delete Product from DB
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${name}' from database?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-session': 'true',
        },
      });

      if (res.ok) {
        setAlertMsg({ type: 'success', text: `Product '${name}' deleted successfully.` });
        await loadProducts();
      }
    } catch (err) {
      console.error('[DELETE PRODUCT ERROR]', err);
    }
  };

  // Image Upload Handler (Base64 / URL)
  const handleAddGalleryImage = () => {
    if (!newImageInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, newImageInput.trim()],
    }));
    setNewImageInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      if (target === 'main') {
        setFormData((prev) => ({ ...prev, mainImage: base64Url }));
      } else {
        setFormData((prev) => ({ ...prev, galleryImages: [...prev.galleryImages, base64Url] }));
      }
    };
    reader.readAsDataURL(file);
  };

  const discountPercent = formData.compareAtPrice > formData.price
    ? Math.round(((formData.compareAtPrice - formData.price) / formData.compareAtPrice) * 100)
    : 0;

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold transition-all shadow-sm ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-stone-500 hover:text-stone-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Quick Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-300/30">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">
              Product Catalogue & SKUs
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage live products, pricing, stock, images, and Next.js SEO metadata permanently in Neon PostgreSQL DB.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#1A1817] hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search products by Name, SKU, or Category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
          >
            <option value="ALL">All Categories</option>
            <option value="kunafa-chocolate">Kunafa Chocolate</option>
            <option value="dark-chocolate">Dark Chocolate</option>
            <option value="milk-chocolate">Milk Chocolate</option>
            <option value="mini-chocolate-bars">Mini Chocolate Bars</option>
            <option value="pistachio-chocolate">Pistachio Chocolate</option>
            <option value="lebubu">Lebubu</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="OutOfStock">Out of Stock</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Product Name & Category</th>
                <th className="py-3.5 px-4 font-mono">SKU Code</th>
                <th className="py-3.5 px-4">Price & MRP</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600 mb-2" />
                    <span>Loading production products from Neon PostgreSQL DB...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No products found matching your search query.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const itemDiscount = prod.compareAtPrice && prod.compareAtPrice > prod.price
                    ? Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)
                    : 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={prod.images?.[0] || '/Kunafa Pistachio Dark Chocolate 1.png'}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg border border-slate-200 object-cover bg-stone-50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-extrabold text-slate-900 text-xs leading-tight">
                          {prod.name}
                        </p>
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block border border-amber-200">
                          {prod.categorySlug || 'Kunafa Chocolate'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 text-xs">
                        {prod.skuCode || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-baseline space-x-1.5">
                          <span className="font-extrabold text-slate-900 text-xs">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                          {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {itemDiscount > 0 && (
                          <span className="text-[9.5px] font-extrabold text-rose-700">
                            {itemDiscount}% OFF
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-mono font-extrabold ${prod.stockQuantity <= 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {prod.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(prod)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                            prod.status === 'Active' && prod.inStock
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {prod.status === 'Active' && prod.inStock ? 'Active' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="View Live Product Page"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Product Modal Window */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#1A1817] text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#CB9700]/20 flex items-center justify-center text-[#CB9700]">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-amber-100">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-sans">
                    Changes save directly to Neon PostgreSQL database and sync to storefront.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Section Navigation Tabs */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2 overflow-x-auto">
              {[
                { id: 'info', label: '1. Product Info' },
                { id: 'pricing', label: '2. Pricing' },
                { id: 'inventory', label: '3. Inventory & Size' },
                { id: 'media', label: '4. Images & Media' },
                { id: 'seo', label: '5. SEO & Metadata' },
                { id: 'status', label: '6. Status & Badges' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-extrabold tracking-wide uppercase transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                    activeFormTab === tab.id
                      ? 'border-[#1A1817] text-[#1A1817] bg-white font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body / Form Controls */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* SECTION 1: PRODUCT INFORMATION */}
              {activeFormTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Kunafa Pistachio Dark Chocolate - 200gm"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="Auto-generated from name if left empty"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Category</label>
                      <select
                        value={formData.categorySlug}
                        onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      >
                        <option value="kunafa-chocolate">Kunafa Chocolate</option>
                        <option value="dark-chocolate">Dark Chocolate</option>
                        <option value="milk-chocolate">Milk Chocolate</option>
                        <option value="mini-chocolate-bars">Mini Chocolate Bars</option>
                        <option value="pistachio-chocolate">Pistachio Chocolate</option>
                        <option value="lebubu">Lebubu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        placeholder="e.g. Luxury Chocolate Bars"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. Pistachio Cream & Crunchy Kunafa Layers"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">Short Description</label>
                    <textarea
                      rows={2}
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Brief overview shown on cards and summary..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">Full Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed product story, craftsmanship, and specifications..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Features (comma separated)</label>
                      <input
                        type="text"
                        value={formData.featuresInput}
                        onChange={(e) => setFormData({ ...formData, featuresInput: e.target.value })}
                        placeholder="Single Origin, 200g Bar"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Ingredients (comma separated)</label>
                      <input
                        type="text"
                        value={formData.ingredientsInput}
                        onChange={(e) => setFormData({ ...formData, ingredientsInput: e.target.value })}
                        placeholder="Cocoa Butter, Pistachios, Kunafa"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={formData.tagsInput}
                        onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                        placeholder="Handcrafted, Gift Box"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: PRICING */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">MRP / Compare-at Price (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.compareAtPrice}
                        onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Calculated Discount</label>
                      <div className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-emerald-700">
                        {discountPercent > 0 ? `${discountPercent}% OFF` : 'No Discount'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: INVENTORY */}
              {activeFormTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">SKU Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.skuCode}
                        onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Weight / Net Quantity</label>
                      <input
                        type="text"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="e.g. 200gm, 110gm, 35gm"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: MEDIA */}
              {activeFormTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">Main Image URL or Upload</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={formData.mainImage}
                        onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                        placeholder="/Kunafa Pistachio Dark Chocolate 1.png"
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer flex items-center space-x-1.5 border border-slate-300">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>Upload File</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'main')} />
                      </label>
                    </div>
                  </div>

                  {formData.mainImage && (
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-700 mb-1">Main Image Preview:</p>
                      <img src={formData.mainImage} alt="Main Preview" className="w-24 h-24 rounded-xl border object-cover bg-stone-50" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">Gallery Images</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newImageInput}
                        onChange={(e) => setNewImageInput(e.target.value)}
                        placeholder="Image URL or upload..."
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryImage}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
                      >
                        Add URL
                      </button>
                      <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer flex items-center space-x-1 border border-slate-300">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'gallery')} />
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3">
                      {formData.galleryImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group">
                          <img src={imgUrl} alt={`Gallery ${idx}`} className="w-20 h-20 rounded-xl border object-cover bg-stone-50" />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                galleryImages: prev.galleryImages.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SEO & METADATA */}
              {activeFormTab === 'seo' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900">
                    💡 <strong>Next.js SEO Sync:</strong> Any updates made here directly update the product&apos;s live HTML &lt;head&gt; metadata, Open Graph preview tags, and social cards.
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="Lebubu Milk Chocolate | LE DAMAS"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Discover premium Lebubu Milk Chocolate from LE DAMAS..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={formData.keywordsInput}
                      onChange={(e) => setFormData({ ...formData, keywordsInput: e.target.value })}
                      placeholder="kunafa chocolate, dubai chocolate, luxury chocolate India"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Canonical URL</label>
                      <input
                        type="text"
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                        placeholder="https://ledamas.in/products/kunafa-pistachio-dark-chocolate-200g"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Open Graph Image URL</label>
                      <input
                        type="text"
                        value={formData.openGraphImage}
                        onChange={(e) => setFormData({ ...formData, openGraphImage: e.target.value })}
                        placeholder="/Kunafa Pistachio Dark Chocolate 1.png"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: STATUS & BADGES */}
              {activeFormTab === 'status' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">Product Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-800"
                      >
                        <option value="Active">Active (Visible on Storefront)</option>
                        <option value="Draft">Draft (Admin Only)</option>
                        <option value="OutOfStock">Out of Stock</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3 pt-5">
                      <input
                        type="checkbox"
                        id="inStockCheck"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <label htmlFor="inStockCheck" className="text-xs font-extrabold text-slate-900 cursor-pointer">
                        In Stock & Orderable
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center space-x-6">
                    <label className="flex items-center space-x-2 text-xs font-extrabold text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isBestSeller}
                        onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600"
                      />
                      <span>BESTSELLER Badge</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs font-extrabold text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600"
                      />
                      <span>FEATURED Badge</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs font-extrabold text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNewRelease}
                        onChange={(e) => setFormData({ ...formData, isNewRelease: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600"
                      />
                      <span>NEW RELEASE Badge</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-extrabold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#1A1817] hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>Save Changes to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
