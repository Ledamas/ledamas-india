'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { getAdminUsersApi } from '@/lib/services/admin-service';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'INVENTORY_STAFF' | 'MARKETING_TEAM' | 'CUSTOMER_SUPPORT';
  lastActive: string;
  permissionsCount: number;
}

export const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsersApi();
      if (res?.users && Array.isArray(res.users) && res.users.length > 0) {
        const mapped: StaffMember[] = res.users.map((u: any, idx: number) => ({
          id: u.id,
          name: u.fullName || (u.email ? u.email.split('@')[0] : 'Staff Member'),
          email: u.email || `${u.phone}@ledamas.com`,
          role: (u.role as any) || (idx === 0 ? 'SUPER_ADMIN' : 'MANAGER'),
          lastActive: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Active Now',
          permissionsCount: u.role === 'SUPER_ADMIN' ? 24 : 12,
        }));
        setStaffList(mapped);
      }
    } catch (err) {
      console.error('[STAFF FETCH ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

const AUDIT_LOGS = [
  { time: '15:42', staff: 'Karan Mehra (Super Admin)', action: 'Updated Product SKU Price', details: 'Kunafa Pistachio Dark Chocolate set to ₹1799' },
  { time: '14:20', staff: 'Amitabh Sen (Inventory Staff)', action: 'Adjusted Warehouse Stock', details: 'Added 240 units to BATCH-2026-101' },
  { time: '12:15', staff: 'Divya Kapoor (Marketing Team)', action: 'Created Coupon Code', details: 'Published promo code LEDAMASVIP20' },
  { time: '10:05', staff: 'Sonali Verma (Store Manager)', action: 'Updated Order Status', details: 'Order #LD-9481 marked as SHIPPED' },
];

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    role: 'MANAGER',
  });

  const handleInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;
    const staff: StaffMember = {
      id: `s-${Date.now()}`,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role || 'MANAGER',
      lastActive: 'Invited',
      permissionsCount: 12,
    };
    setStaffList([staff, ...staffList]);
    setIsInviteModalOpen(false);
  };

  const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: 'bg-black text-white font-bold',
    MANAGER: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
    INVENTORY_STAFF: 'bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold',
    MARKETING_TEAM: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold',
    CUSTOMER_SUPPORT: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            👨‍💼 Staff Management & RBAC Permissions
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Assign team roles (Super Admin, Store Manager, Inventory Staff, Marketing Team, Customer Support) and audit live actions.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-black hover:bg-stone-800 text-white font-sans text-xs font-bold shadow-md cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-[#CB9700]" />
          <span>Invite Staff Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff Directory Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="font-serif font-bold text-black text-base">Authorized Team Accounts</h3>
              <span className="text-xs font-mono text-black font-bold">{staffList.length} Active Accounts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-sans text-stone-600 uppercase tracking-wider bg-stone-100">
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-sm font-sans">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-black font-serif text-base">{staff.name}</p>
                        <p className="text-xs text-stone-500 font-mono">{staff.email}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${ROLE_COLORS[staff.role]}`}>
                          {staff.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono text-stone-700">
                        {staff.lastActive}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Editing permissions for ${staff.name}`)}
                          className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-black text-xs font-bold transition-colors cursor-pointer border border-stone-300"
                        >
                          Permissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real-time Audit Log Ticker */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-serif font-bold text-black flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#CB9700]" /> Real-Time Staff Audit Log
              </h3>
              <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">Live</span>
            </div>

            <div className="space-y-3">
              {AUDIT_LOGS.map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-black font-bold">{log.time}</span>
                    <span className="text-stone-500 truncate max-w-[140px]">{log.staff}</span>
                  </div>
                  <p className="text-xs font-semibold text-black">{log.action}</p>
                  <p className="text-[11px] text-stone-600 font-mono">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="text-xl font-serif font-bold text-black">Invite Staff Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-stone-500 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleInviteStaff} className="space-y-4">
              <div>
                <label className="type-label text-xs font-sans text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter staff full name"
                  value={newStaff.name || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="type-label text-xs font-sans text-stone-700 block mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="email@ledamas.in"
                  value={newStaff.email || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="type-label text-xs font-sans text-stone-700 block mb-1">Assign Role *</label>
                <select
                  value={newStaff.role || 'MANAGER'}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                >
                  <option value="SUPER_ADMIN">Super Admin (Full Control)</option>
                  <option value="MANAGER">Store Manager</option>
                  <option value="INVENTORY_STAFF">Inventory & Stock Staff</option>
                  <option value="MARKETING_TEAM">Marketing Team</option>
                  <option value="CUSTOMER_SUPPORT">Customer Support</option>
                </select>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-xs text-stone-600 hover:text-black">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-black text-white font-bold text-xs">Send Invite Link</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
