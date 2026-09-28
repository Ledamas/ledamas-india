'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  Lock,
  Search,
  Check,
  Building2,
  Sparkles,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Plus,
  ArrowRight,
  Activity,
  X,
  Store,
  Crown,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { AdminTab } from './admin-sidebar';

interface AdminHeaderProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLockAdmin: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: 'order' | 'inventory' | 'security' | 'system';
  unread: boolean;
  targetTab?: AdminTab;
}

const STORES = [
  {
    id: 'store-1',
    name: 'LE DAMAS CONFECTIONERY PVT LTD',
    subtitle: 'Main Direct-to-Consumer Online Store',
    tag: 'Primary D2C',
    region: 'India & GCC',
    active: true,
  },
  {
    id: 'store-2',
    name: 'LE DAMAS DUBAI BOUTIQUE',
    subtitle: 'Flagship Luxury Storefront',
    tag: 'Flagship Store',
    region: 'Dubai, UAE',
    active: false,
  },
  {
    id: 'store-3',
    name: 'LE DAMAS CORPORATE & B2B',
    subtitle: 'Bulk Gifting & Enterprise Sales',
    tag: 'B2B Gifting',
    region: 'Global',
    active: false,
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High-Value Corporate Order Received',
    desc: 'Order #LD-9482 for 50x Luxury Baklava Boxes (₹1,45,000) awaits dispatch verification.',
    time: '2 mins ago',
    category: 'order',
    unread: true,
    targetTab: 'orders',
  },
  {
    id: 'notif-2',
    title: 'Low Stock Alert: Premium Kunafa Dark Chocolate',
    desc: 'Inventory dropped below safety threshold (14 units remaining in Central Hub).',
    time: '15 mins ago',
    category: 'inventory',
    unread: true,
    targetTab: 'inventory',
  },
  {
    id: 'notif-3',
    title: 'VIP Customer Verified: Ananya Sharma',
    desc: 'Customer upgraded to VIP Gold Tier with 8 repeat purchases.',
    time: '1 hour ago',
    category: 'system',
    unread: false,
    targetTab: 'crm',
  },
  {
    id: 'notif-4',
    title: 'WhatsApp Business API Synchronized',
    desc: 'Automated dispatch tracking templates refreshed successfully with Meta.',
    time: '3 hours ago',
    category: 'security',
    unread: false,
    targetTab: 'whatsapp',
  },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  onLockAdmin,
}) => {
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        storeDropdownRef.current &&
        !storeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStoreDropdown(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for command search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Quick Search Results filtering
  const searchableActions = [
    { title: 'View All Live Orders', tab: 'orders' as AdminTab, icon: '📦' },
    { title: 'Add New Product SKU', tab: 'products' as AdminTab, icon: '✨' },
    { title: 'Stock & Inventory Audit', tab: 'inventory' as AdminTab, icon: '📊' },
    { title: 'Customer 360 CRM & Lifetime Value', tab: 'crm' as AdminTab, icon: '👥' },
    { title: 'Discount Codes & Offer Campaigns', tab: 'marketing' as AdminTab, icon: '🏷️' },
    { title: 'Live Visitor Map & Analytics', tab: 'traffic' as AdminTab, icon: '🌐' },
    { title: 'WhatsApp Alert Logs & Automated Messages', tab: 'whatsapp' as AdminTab, icon: '💬' },
    { title: 'Trust, Anti-Fraud & Chargeback Shield', tab: 'safety' as AdminTab, icon: '🛡️' },
  ];

  const filteredSearch = searchableActions.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Sticky Glassmorphic Header */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs transition-all duration-200">
        {/* Left Section: Company Switcher & Verified Tier Badge */}
        <div className="flex items-center space-x-3.5">
          {/* Company Selector Dropdown */}
          <div className="relative" ref={storeDropdownRef}>
            <button
              onClick={() => setShowStoreDropdown(!showStoreDropdown)}
              className="group flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all text-left cursor-pointer"
              title="Switch Active Store Entity"
            >
              <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/20">
                <Building2 className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xs tracking-tight text-slate-900 truncate max-w-[220px] sm:max-w-[300px]">
                    {selectedStore.name}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${showStoreDropdown ? 'rotate-180 text-amber-600' : 'group-hover:text-slate-600'}`} />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold truncate leading-none">
                  {selectedStore.subtitle}
                </span>
              </div>
            </button>

            {/* Store Dropdown Menu */}
            {showStoreDropdown && (
              <div className="absolute left-0 mt-2 w-84 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Select Merchant Business
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    3 Active Outlets
                  </span>
                </div>

                <div className="py-1 space-y-1">
                  {STORES.map((store) => {
                    const isSelected = selectedStore.id === store.id;
                    return (
                      <button
                        key={store.id}
                        onClick={() => {
                          setSelectedStore(store);
                          setShowStoreDropdown(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white font-medium shadow-xs'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <Store
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isSelected ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-700'
                            }`}
                          />
                          <div>
                            <p className="text-xs font-bold leading-snug truncate">
                              {store.name}
                            </p>
                            <p
                              className={`text-[11px] ${
                                isSelected ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {store.subtitle}
                            </p>
                            <span
                              className={`inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {store.tag} • {store.region}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 mt-1">
                  <button
                    onClick={() => {
                      setShowStoreDropdown(false);
                      setActiveTab('settings');
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Manage Merchant Outlets</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Platinum / Verified Merchant Badge */}
          <button
            onClick={() => setShowTierModal(true)}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition-all cursor-pointer shadow-xs border border-slate-700 hover:scale-[1.02]"
            title="Click to view Merchant Status & Verified Tier benefits"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="tracking-tight text-amber-300 font-black">Enterprise Merchant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
          </button>
        </div>

        {/* Center: Command / Quick Search Input */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium transition-all group cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="text-slate-500 group-hover:text-slate-700 font-semibold">
                Quick Action / Search SKU, Orders, CRM...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-400 border border-slate-200 shadow-2xs">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Section: System Health, Live Storefront, Notifications, Security Lock, Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Live Storefront External Button */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-black px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all shadow-2xs group"
            title="Open customer-facing website in new tab"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Lock Panel Security Button */}
          <button
            onClick={onLockAdmin}
            className="flex items-center space-x-1.5 text-xs font-extrabold text-rose-700 hover:text-rose-900 px-3 py-1.5 rounded-lg border border-rose-200/90 bg-rose-50 hover:bg-rose-100/80 transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
            title="Lock current admin workspace session"
          >
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>Lock Panel</span>
          </button>

          {/* Notification Center */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 relative cursor-pointer transition-colors border border-transparent hover:border-slate-200"
              title="Seller Notifications & Alerts"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-88 sm:w-96 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl space-y-3 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
                      Merchant Alert Center
                    </h4>
                    {unreadCount > 0 ? (
                      <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {unreadCount} Unread
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        All Catch-up
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-extrabold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No recent notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border text-xs transition-all relative group ${
                          notif.unread
                            ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                            : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                notif.unread ? 'bg-amber-600' : 'bg-slate-300'
                              }`}
                            />
                            <h5 className="font-bold text-slate-900 leading-snug">
                              {notif.title}
                            </h5>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notif.id);
                            }}
                            className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            title="Dismiss notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1 pl-4 leading-relaxed">
                          {notif.desc}
                        </p>
                        <div className="flex items-center justify-between mt-2 pl-4">
                          <span className="text-[10px] font-medium text-slate-400">
                            {notif.time}
                          </span>
                          {notif.targetTab && (
                            <button
                              onClick={() => {
                                setShowNotifications(false);
                                if (notif.targetTab) setActiveTab(notif.targetTab);
                              }}
                              className="text-[10px] font-black text-slate-900 hover:text-amber-700 flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Live System Synchronizer Active • Real-time Webhooks
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Admin User Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title="Admin User Account"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center justify-center border border-slate-800 shadow-2xs relative">
                LD
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                      LD
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-slate-900 truncate">
                        Super Administrator
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        admin@ledamas.in
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Role: Super Admin
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      2FA Protected
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5 py-1 text-xs">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('settings');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Store Settings & API Keys</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('safety');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-slate-500" />
                    <span>Security & Anti-Fraud Logs</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowTierModal(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold text-slate-700 hover:text-black hover:bg-slate-100 transition-colors"
                  >
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Merchant Tier Status</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 mt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLockAdmin();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>Lock Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command / Quick Action Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-slate-50/50">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search SKU, order ID, customer name, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold outline-none text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results List */}
            <div className="p-3 max-h-96 overflow-y-auto space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Quick Navigation & Actions
              </p>
              {filteredSearch.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-medium">
                  No matching module found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredSearch.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTab(item.tab);
                      setShowSearchModal(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                        {item.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 transition-colors" />
                  </button>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 text-right text-[10px] font-bold text-slate-400">
              Press <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">ESC</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Tier Info Modal */}
      {showTierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Enterprise Merchant Tier
                  </h3>
                  <p className="text-xs text-emerald-600 font-bold">
                    ✓ Fully Verified & Insured
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTierModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 space-y-1">
                <p className="font-black text-xs">LE DAMAS Certified Brand Account</p>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Your merchant workspace is configured for direct fulfillment, automated WhatsApp transaction updates, and real-time inventory synchronization.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider text-[10px]">
                  Included Merchant Privileges:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2 text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>0% Platform Processing Surcharge</span>
                  </li>
                  <li className="flex items-center space-x-2 text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant Same-Day Payout Settlement</span>
                  </li>
                  <li className="flex items-center space-x-2 text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated Priority Account Manager</span>
                  </li>
                  <li className="flex items-center space-x-2 text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>AI-Powered Fraud & Chargeback Shield Active</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowTierModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors"
            >
              Close Merchant Overview
            </button>
          </div>
        </div>
      )}
    </>
  );
};
