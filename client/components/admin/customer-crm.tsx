import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { getAdminUsersApi } from '@/lib/services/admin-service';

export interface CustomerCRMRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  isVIP: boolean;
  lifetimeValue: number;
  totalOrders: number;
  lastOrderDate: string;
  adminNotes?: string;
  authProvider?: string;
}

const INITIAL_CUSTOMERS: CustomerCRMRecord[] = [];

export const CustomerCRM: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerCRMRecord[]>(INITIAL_CUSTOMERS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vipOnly, setVipOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCRMRecord | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsersApi();
      if (res?.users && res.users.length > 0) {
        const mapped = res.users.map((u: any) => ({
          id: u.id,
          fullName: u.fullName || 'Customer',
          email: u.email || 'N/A',
          phone: u.phone || 'Google Verified',
          city: u.city || 'India',
          isVIP: Boolean(u.isVIP),
          lifetimeValue: u.lifetimeValue || 0,
          totalOrders: u.totalOrders || 0,
          lastOrderDate: u.lastOrderDate || u.createdAt?.split('T')[0] || 'Recently',
          adminNotes: u.authProvider ? `Authenticated via ${u.authProvider}` : 'Database Customer',
          authProvider: u.authProvider || 'Web Account',
        }));
        setCustomers(mapped);
      }
    } catch (e) {
      console.warn('[CRM FETCH ERROR]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredCustomers = customers.filter((cust) => {
    const matchesQuery =
      cust.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery);
    return vipOnly ? matchesQuery && cust.isVIP : matchesQuery;
  });

  const handleToggleVIP = (id: string) => {
    setCustomers(
      customers.map((c) => (c.id === id ? { ...c, isVIP: !c.isVIP } : c))
    );
  };

  const handleSaveNotes = (id: string) => {
    setCustomers(
      customers.map((c) => (c.id === id ? { ...c, adminNotes: editingNotes } : c))
    );
    if (selectedCustomer) {
      setSelectedCustomer({ ...selectedCustomer, adminNotes: editingNotes });
    }
  };

  const vipCount = customers.filter((c) => c.isVIP).length;

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            👥 Customer CRM & Lifetime Value
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Customer profiles, order history tracking, VIP tagging, internal notes, and direct WhatsApp communication.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center space-x-3">
            <Crown className="w-5 h-5 text-[#CB9700]" />
            <div>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono font-bold">VIP Patrons</p>
              <p className="text-sm font-bold font-mono text-black">{vipCount} Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patron by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs text-black pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-black"
          />
        </div>

        <button
          onClick={() => setVipOnly(!vipOnly)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
            vipOnly
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-black border border-stone-300 hover:bg-stone-100'
          }`}
        >
          <Crown className="w-4 h-4 text-[#CB9700]" />
          <span>{vipOnly ? 'Showing VIP Patrons Only' : 'Filter VIP Patrons'}</span>
        </button>
      </div>

      {/* CRM Datatable */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-sans text-stone-600 uppercase tracking-wider bg-stone-100">
                <th className="py-4 px-4">Patron Details</th>
                <th className="py-4 px-4">Contact & Location</th>
                <th className="py-4 px-4 font-mono">Total Orders</th>
                <th className="py-4 px-4 font-mono">Lifetime Value (LTV)</th>
                <th className="py-4 px-4">VIP Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm font-sans">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-serif font-bold text-sm border border-stone-300">
                        {customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-black font-serif text-base">{customer.fullName}</p>
                        <p className="text-xs text-stone-700 font-medium">Last active: {customer.lastOrderDate}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs font-sans">
                    <p className="text-black font-extrabold font-mono flex items-center gap-1.5 text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex">
                      <Phone className="w-3.5 h-3.5 text-black" /> {customer.phone}
                    </p>
                    <p className="text-stone-800 font-semibold flex items-center gap-1 mt-1">
                      <Mail className="w-3.5 h-3.5 text-[#CB9700]" /> {customer.email}
                    </p>
                  </td>

                  <td className="py-4 px-4 font-mono font-extrabold text-black text-sm">
                    {customer.totalOrders} orders
                  </td>

                  <td className="py-4 px-4 font-mono font-extrabold text-[#CB9700] text-base">
                    ₹{customer.lifetimeValue.toLocaleString('en-IN')}
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleVIP(customer.id)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer transition-all ${
                        customer.isVIP
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-100 text-stone-700 hover:text-black border border-stone-300'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5 text-[#CB9700]" />
                      <span>{customer.isVIP ? 'VIP Patron' : 'Standard'}</span>
                    </button>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          const url = `https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(customer.fullName)},%20greetings%20from%20LE%20DAMAS%20Luxury%20Confections!`;
                          window.open(url, '_blank');
                        }}
                        className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1 text-xs font-bold"
                        title="Send Direct WhatsApp Alert"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setEditingNotes(customer.adminNotes || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-stone-800 text-xs font-bold transition-colors cursor-pointer border border-black"
                      >
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detailed Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-serif font-bold text-xl border border-stone-300">
                  {selectedCustomer.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-black">{selectedCustomer.fullName}</h3>
                  <p className="text-xs text-stone-600 font-mono">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-stone-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
              <div>
                <p className="text-stone-500">Total Spent (LTV):</p>
                <p className="text-lg font-bold font-mono text-[#CB9700]">₹{selectedCustomer.lifetimeValue.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-stone-500">Order Frequency:</p>
                <p className="text-lg font-bold font-mono text-black">{selectedCustomer.totalOrders} Orders</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="type-label text-xs font-sans text-stone-700 block">
                Internal Staff & Gifting Notes
              </label>
              <textarea
                rows={4}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Add private staff notes regarding customer preferences..."
                className="w-full bg-stone-50 text-xs text-black p-3 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-stone-200">
              <button
                onClick={() => {
                  const url = `https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=Dear%20${encodeURIComponent(selectedCustomer.fullName)},%20we%20have%20an%20exclusive%20LE%20DAMAS%20reward%20for%20you!`;
                  window.open(url, '_blank');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch WhatsApp Offer</span>
              </button>

              <div className="space-x-2">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:text-black"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSaveNotes(selectedCustomer.id)}
                  className="px-5 py-2 rounded-xl bg-black text-white font-bold text-xs"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
