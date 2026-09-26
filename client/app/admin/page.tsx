'use client';

import React, { useState } from 'react';
import { AdminSidebar, AdminTab } from '@/components/admin/admin-sidebar';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { LiveVisitorTracker } from '@/components/admin/live-visitor-tracker';
import { WebsiteDisplayManagement } from '@/components/admin/website-display-management';
import { ProductManagement } from '@/components/admin/product-management';
import { InventoryManagement } from '@/components/admin/inventory-management';
import { OrderManagement } from '@/components/admin/order-management';
import { CustomerCRM } from '@/components/admin/customer-crm';
import { MarketingOffers } from '@/components/admin/marketing-offers';
import { SeoManagement } from '@/components/admin/seo-management';
import { WhatsappNotifications } from '@/components/admin/whatsapp-notifications';
import { TrustSafetyManagement } from '@/components/admin/trust-safety-management';
import { StoreSettingsManagement } from '@/components/admin/store-settings-management';
import {
  Bell,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [currentRole, setCurrentRole] = useState<string>('SUPER_ADMIN');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('GENECIA GLOBAL DELIGHTS PRIVATE LIMITED');

  const notificationsList = [
    { title: 'New High-Value Order #LD-9482', time: '2 mins ago', unread: true },
    { title: 'Low Stock Warning: Kunafa Dark Chocolate 200g', time: '15 mins ago', unread: true },
    { title: 'New VIP Customer Tagged: Ananya Sharma', time: '1 hour ago', unread: false },
    { title: 'WhatsApp Webhook Synchronized', time: '3 hours ago', unread: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex font-sans selection:bg-amber-500 selection:text-white">
      {/* Light Seller Hub Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      {/* Main Seller Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Blinkit Seller Hub Style Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
          {/* Left: Company Selector & Seller Tier Badge */}
          <div className="flex items-center space-x-3">
            <div className="relative group cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
              <span className="font-bold text-xs uppercase tracking-tight text-slate-800 truncate max-w-[280px]">
                {selectedCompany}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </div>

            {/* Seller Tier Badge */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Iron</span>
              <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 text-[10px] flex items-center justify-center font-bold ml-0.5">
                🛡️
              </span>
            </div>
          </div>

          {/* Right: Quick actions, Help, Notifications, User Profile */}
          <div className="flex items-center space-x-4">
            {/* View Live Store */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-md border border-slate-300 hover:border-slate-400 bg-white transition-all"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3 text-amber-600 ml-0.5" />
            </a>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-700 relative cursor-pointer transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  2
                </span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl p-3 shadow-xl space-y-2 z-50 text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-xs text-slate-900">Seller Alerts</h4>
                    <span className="text-[10px] font-bold text-blue-600">2 Unread</span>
                  </div>
                  <div className="space-y-1.5">
                    {notificationsList.map((notif, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs ${
                          notif.unread
                            ? 'bg-slate-50 border border-slate-200 font-semibold'
                            : 'bg-white'
                        }`}
                      >
                        <p className="text-slate-800 leading-tight">{notif.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help / Support Icon */}
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors" title="Help & Support">
              <HelpCircle className="w-4 h-4 text-slate-700" />
            </button>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-300 shadow-2xs">
              G
            </div>
          </div>
        </header>

        {/* Dynamic Admin Module View */}
        <main className="p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'traffic' && <LiveVisitorTracker />}
          {activeTab === 'display' && <WebsiteDisplayManagement />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'crm' && <CustomerCRM />}
          {activeTab === 'marketing' && <MarketingOffers />}
          {activeTab === 'seo' && <SeoManagement />}
          {activeTab === 'whatsapp' && <WhatsappNotifications />}
          {activeTab === 'safety' && <TrustSafetyManagement />}
          {activeTab === 'settings' && <StoreSettingsManagement />}
        </main>
      </div>
    </div>
  );
}

