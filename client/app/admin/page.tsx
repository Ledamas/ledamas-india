'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar, AdminTab } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { GrowthAnalytics } from '@/components/admin/growth-analytics';
import { LiveVisitorTracker } from '@/components/admin/live-visitor-tracker';
import { WebsiteDisplayManagement } from '@/components/admin/website-display-management';
import { ProductManagement } from '@/components/admin/product-management';
import { InventoryManagement } from '@/components/admin/inventory-management';
import { OrderManagement } from '@/components/admin/order-management';
import { CustomerCRM } from '@/components/admin/customer-crm';
import { MarketingOffers } from '@/components/admin/marketing-offers';
import { SeoManagement } from '@/components/admin/seo-management';
import { NotificationsManagement } from '@/components/admin/notifications-management';
import { TrustSafetyManagement } from '@/components/admin/trust-safety-management';
import { StoreSettingsManagement } from '@/components/admin/store-settings-management';
import { AdminLockScreen } from '@/components/admin/admin-lock-screen';

export default function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [currentRole, setCurrentRole] = useState<string>('SUPER_ADMIN');

  // Verify Admin Session on Mount
  useEffect(() => {
    try {
      const localToken = localStorage.getItem('ledamas_admin_session');
      const sessionToken = sessionStorage.getItem('ledamas_admin_session');

      if (localToken || sessionToken) {
        setIsUnlocked(true);
      }
    } catch (e) {
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const handleLockAdmin = () => {
    try {
      localStorage.removeItem('ledamas_admin_session');
      localStorage.removeItem('ledamas_admin_auth_time');
      sessionStorage.removeItem('ledamas_admin_session');
    } catch (e) {}
    setIsUnlocked(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0E0C0B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#CB9700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Password Lock Gatekeeper Protection Screen
  if (!isUnlocked) {
    return <AdminLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

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
        {/* Realistic Sticky Admin Header */}
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLockAdmin={handleLockAdmin}
        />

        {/* Dynamic Admin Module View */}
        <main className="p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'growth' && <GrowthAnalytics />}
          {activeTab === 'traffic' && <LiveVisitorTracker />}
          {activeTab === 'display' && <WebsiteDisplayManagement />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'crm' && <CustomerCRM />}
          {activeTab === 'marketing' && <MarketingOffers />}
          {activeTab === 'seo' && <SeoManagement />}
          {activeTab === 'notifications' && <NotificationsManagement />}
          {activeTab === 'safety' && <TrustSafetyManagement />}
          {activeTab === 'settings' && <StoreSettingsManagement />}
        </main>
      </div>
    </div>
  );
}
