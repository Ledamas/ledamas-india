'use client';

import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  Search,
  MessageSquare,
  LogOut,
  Layout,
  Activity,
  Settings,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export type AdminTab =
  | 'analytics'
  | 'growth'
  | 'traffic'
  | 'display'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'crm'
  | 'marketing'
  | 'seo'
  | 'notifications'
  | 'whatsapp'
  | 'safety'
  | 'settings';

export interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  currentRole: string;
  setCurrentRole: (role: string) => void;
}

export const NAV_ITEMS: {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'analytics', label: 'Analytics Dashboard', icon: LayoutDashboard },
  { id: 'growth', label: 'Growth & Performance', icon: TrendingUp },
  { id: 'traffic', label: 'Live Visitors & Events', icon: Activity },
  { id: 'display', label: 'Website Display Manager', icon: Layout },
  { id: 'products', label: 'Product Catalog & SKUs', icon: Package },
  { id: 'inventory', label: 'Inventory & Stock Batches', icon: Boxes },
  { id: 'orders', label: 'Order Fulfillment', icon: ShoppingBag },
  { id: 'crm', label: 'Customer 360 CRM', icon: Users },
  { id: 'marketing', label: 'Offers & Marketing', icon: Tag },
  { id: 'seo', label: 'SEO & Schema Studio', icon: Search },
  { id: 'notifications', label: 'Notifications & Alerts', icon: MessageSquare },
  { id: 'safety', label: 'Trust & Safety Studio', icon: ShieldAlert },
  { id: 'settings', label: 'Business & Store Settings', icon: Settings },
];

export const STAFF_ROLES = [
  { id: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-black text-white font-extrabold' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <aside className="w-80 bg-white border-r border-slate-200 min-h-screen p-6 flex flex-col justify-between text-slate-900 shrink-0 sticky top-0 h-screen overflow-y-auto select-none shadow-xs">
      <div>
        {/* LE DAMAS Official Brand Header */}
        <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-100 mb-6 text-center space-y-2">
          <a href="/" className="group block py-1 transition-transform hover:scale-105 duration-200">
            <img
              src="/Le-Damas-Sweets-Logo-enhanced.png"
              alt="Le Damas Sweets Logo"
              className="h-14 w-auto object-contain filter drop-shadow-xs"
            />
          </a>
          <span className="text-[11px] font-sans tracking-widest text-slate-800 uppercase font-black bg-slate-100 border border-slate-300 px-4 py-1 rounded-full">
            SUPER ADMIN PANEL
          </span>
        </div>

        {/* Navigation Links — Pure Black & White Simple Professional Styling */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-sans text-sm transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-black text-white font-black shadow-md scale-[1.01]'
                    : 'text-slate-800 font-extrabold hover:bg-slate-100 hover:text-black'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-600 group-hover:text-black'
                    }`}
                  />
                  <span className="tracking-tight whitespace-nowrap text-sm font-extrabold">{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-white shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Storefront Exit */}
      <div className="pt-5 border-t border-slate-200 space-y-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-900 shrink-0 font-black">
            <Sparkles className="w-4.5 h-4.5 text-slate-800" />
          </div>
          <div className="text-xs">
            <p className="font-black text-slate-900">LE DAMAS v2.4</p>
            <p className="text-[10px] text-slate-600 font-black font-mono">Storefront Synced</p>
          </div>
        </div>

        <a
          href="/"
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-slate-200 shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Exit to Customer Store</span>
        </a>
      </div>
    </aside>
  );
};





