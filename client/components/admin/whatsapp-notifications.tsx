'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Send,
  Key,
  Bell,
} from 'lucide-react';

export interface NotificationRule {
  id: string;
  triggerName: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  recipient: 'CUSTOMER' | 'STAFF' | 'BOTH';
  templateText: string;
  isEnabled: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationRule[] = [
  {
    id: 'notif-1',
    triggerName: 'Order Confirmation Instant Ticker',
    channel: 'WHATSAPP',
    recipient: 'CUSTOMER',
    templateText: 'Greetings {{customer_name}}! 🍫 Your LE DAMAS order #{{order_number}} for {{order_total}} has been confirmed and sent to our master chocolatiers.',
    isEnabled: true,
  },
  {
    id: 'notif-2',
    triggerName: 'Dispatch & Cold-Chain Shipping Ticker',
    channel: 'WHATSAPP',
    recipient: 'CUSTOMER',
    templateText: 'Exciting news {{customer_name}}! Your LE DAMAS confections are on the way via {{carrier_name}}. Tracking ID: {{tracking_number}}.',
    isEnabled: true,
  },
  {
    id: 'notif-3',
    triggerName: 'Warehouse Low Stock Emergency Trigger',
    channel: 'WHATSAPP',
    recipient: 'STAFF',
    templateText: '⚠️ ALERT: Stock for {{product_name}} (Batch {{batch_number}}) has dropped below threshold! Current stock: {{current_stock}} units.',
    isEnabled: true,
  },
  {
    id: 'notif-4',
    triggerName: 'Abandoned Cart Recovery (1 Hour Delay)',
    channel: 'WHATSAPP',
    recipient: 'CUSTOMER',
    templateText: 'Hello {{customer_name}}, did you forget your artisan dark chocolate truffles in your cart? Complete your order now and get free shipping!',
    isEnabled: false,
  },
];

export const WhatsappNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRule[]>(INITIAL_NOTIFICATIONS);
  const [apiPhoneId, setApiPhoneId] = useState('109482910482019');
  const [bearerToken, setBearerToken] = useState('EAAGk...82910');

  const handleToggle = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isEnabled: !n.isEnabled } : n))
    );
  };

  const handleTestWhatsAppDispatch = (notif: NotificationRule) => {
    alert(`[WhatsApp API Test] Dispatched template payload for "${notif.triggerName}" to WhatsApp API sandbox.`);
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            📱 WhatsApp & Automated Notification Hub
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Automated WhatsApp Business API triggers for Order Confirmations, Out for Delivery alerts, Low-stock staff warnings, and Cart Recovery.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Meta WhatsApp Business API Connected</span>
        </div>
      </div>

      {/* Meta API Config Card */}
      <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-black text-lg flex items-center gap-2">
          <Key className="w-5 h-5 text-[#CB9700]" /> WhatsApp Cloud API Webhook Integration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <label className="type-label text-xs text-stone-700 block mb-1">WhatsApp Phone Number ID</label>
            <input
              type="text"
              value={apiPhoneId}
              onChange={(e) => setApiPhoneId(e.target.value)}
              className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 font-mono focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="type-label text-xs text-stone-700 block mb-1">Permanent Access Bearer Token</label>
            <input
              type="password"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              className="w-full bg-white text-black p-2.5 rounded-xl border border-stone-300 font-mono focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notification Rules List */}
      <div className="space-y-4">
        <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#CB9700]" /> Automated Dispatch Triggers
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-black text-base">{notif.triggerName}</h4>
                  <div className="flex items-center space-x-2 text-xs text-stone-500 mt-0.5">
                    <span className="font-mono bg-stone-100 text-black px-2 py-0.5 rounded border border-stone-300">
                      {notif.channel}
                    </span>
                    <span>•</span>
                    <span className="font-sans">Recipient: {notif.recipient}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTestWhatsAppDispatch(notif)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer border border-emerald-300 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Test Dispatch
                  </button>

                  <button
                    onClick={() => handleToggle(notif.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold cursor-pointer transition-all ${
                      notif.isEnabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 text-stone-500 border border-stone-300'
                    }`}
                  >
                    {notif.isEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 leading-relaxed">
                {notif.templateText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
