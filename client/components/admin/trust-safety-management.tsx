'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  UserX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Phone,
  Mail,
  Filter,
  Lock,
  RefreshCw,
  Ban,
} from 'lucide-react';

export interface UserReportItem {
  id: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  reportType: 'PAYMENT_FRAUD' | 'COD_ABUSE' | 'SPAM_REVIEWS' | 'SUSPICIOUS_OTP';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  reportedAt: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

export interface BlockedUserItem {
  id: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  blockedReason: string;
  blockedDate: string;
  blockedBy: string;
  ipAddress: string;
}

const INITIAL_REPORTS: UserReportItem[] = [
  {
    id: 'rep-101',
    userName: 'Sameer Verma',
    userPhone: '+91 98199 88776',
    userEmail: 'sameer.v@example.com',
    reportType: 'COD_ABUSE',
    severity: 'HIGH',
    description: 'Refused COD payment on delivery 3 consecutive times in Mumbai.',
    reportedAt: '2026-09-17 14:30',
    status: 'PENDING',
  },
  {
    id: 'rep-102',
    userName: 'Kunal Kapoor',
    userPhone: '+91 97112 33445',
    userEmail: 'kunal.k@example.com',
    reportType: 'PAYMENT_FRAUD',
    severity: 'HIGH',
    description: 'Multiple failed UPI transaction retries from flagged IP range.',
    reportedAt: '2026-09-17 11:15',
    status: 'PENDING',
  },
  {
    id: 'rep-103',
    userName: 'Neha Gupta',
    userPhone: '+91 98200 44556',
    userEmail: 'neha.g@example.com',
    reportType: 'SPAM_REVIEWS',
    severity: 'LOW',
    description: 'Posted repetitive promotional link comments on product page.',
    reportedAt: '2026-09-16 18:45',
    status: 'RESOLVED',
  },
  {
    id: 'rep-104',
    userName: 'Rajesh Singhal',
    userPhone: '+91 99300 77889',
    userEmail: 'rajesh.s@example.com',
    reportType: 'SUSPICIOUS_OTP',
    severity: 'MEDIUM',
    description: 'Exceeded 15 OTP login requests in 5 minutes.',
    reportedAt: '2026-09-15 09:20',
    status: 'DISMISSED',
  },
];

const INITIAL_BLOCKED: BlockedUserItem[] = [
  {
    id: 'blk-1',
    userName: 'Amitabh Sen',
    userPhone: '+91 98311 00998',
    userEmail: 'amitabh.sen@example.com',
    blockedReason: 'Stolen card authorization chargeback attempt.',
    blockedDate: '2026-09-10',
    blockedBy: 'Super Admin',
    ipAddress: '103.22.45.18',
  },
  {
    id: 'blk-2',
    userName: 'Tarun Saxena',
    userPhone: '+91 99011 44332',
    userEmail: 'tarun.s@example.com',
    blockedReason: 'Fake address creation for bulk trial orders.',
    blockedDate: '2026-09-08',
    blockedBy: 'Super Admin',
    ipAddress: '49.207.12.91',
  },
];

export const TrustSafetyManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'blocklist'>('reports');
  const [reports, setReports] = useState<UserReportItem[]>(INITIAL_REPORTS);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>(INITIAL_BLOCKED);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Modal State for Manual Block
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    userName: '',
    userPhone: '',
    userEmail: '',
    blockedReason: '',
  });

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userPhone.includes(searchQuery) ||
      r.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = filterSeverity === 'ALL' || r.severity === filterSeverity;
    return matchesSearch && matchesSev;
  });

  // Filtered block list
  const filteredBlocked = blockedUsers.filter(
    (b) =>
      b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.userPhone.includes(searchQuery) ||
      b.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.blockedReason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResolveReport = (id: string) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'RESOLVED' } : r)));
  };

  const handleDismissReport = (id: string) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'DISMISSED' } : r)));
  };

  const handleBlockUserFromReport = (report: UserReportItem) => {
    if (window.confirm(`Are you sure you want to block user ${report.userName} (${report.userPhone})?`)) {
      const newBlocked: BlockedUserItem = {
        id: `blk-${Date.now()}`,
        userName: report.userName,
        userPhone: report.userPhone,
        userEmail: report.userEmail,
        blockedReason: `Blocked from report #${report.id}: ${report.description}`,
        blockedDate: new Date().toISOString().split('T')[0],
        blockedBy: 'Super Admin',
        ipAddress: '103.45.12.89',
      };
      setBlockedUsers([newBlocked, ...blockedUsers]);
      setReports(reports.map((r) => (r.id === report.id ? { ...r, status: 'RESOLVED' } : r)));
    }
  };

  const handleUnblockUser = (id: string, name: string) => {
    if (window.confirm(`Unblock user ${name} and restore site access?`)) {
      setBlockedUsers(blockedUsers.filter((b) => b.id !== id));
    }
  };

  const handleManualBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm.userPhone && !blockForm.userName) return;

    const newBlocked: BlockedUserItem = {
      id: `blk-${Date.now()}`,
      userName: blockForm.userName || 'Unknown Patron',
      userPhone: blockForm.userPhone,
      userEmail: blockForm.userEmail || 'N/A',
      blockedReason: blockForm.blockedReason || 'Manual Super Admin block.',
      blockedDate: new Date().toISOString().split('T')[0],
      blockedBy: 'Super Admin',
      ipAddress: '182.73.11.04',
    };

    setBlockedUsers([newBlocked, ...blockedUsers]);
    setBlockForm({ userName: '', userPhone: '', userEmail: '', blockedReason: '' });
    setIsBlockModalOpen(false);
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-rose-600" /> Trust & Safety Studio
          </h2>
          <p className="type-body text-stone-700 text-sm font-medium mt-1">
            Manage flagged user reports, spam prevention, customer block lists, and store security controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsBlockModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-black hover:bg-stone-800 text-white font-sans text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <UserX className="w-4 h-4 text-rose-400" />
            <span>Block Customer / Phone</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'reports'
                ? 'bg-black text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-[#CB9700]" />
            <span>User Reports & Flagged Activity ({reports.filter((r) => r.status === 'PENDING').length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('blocklist')}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'blocklist'
                ? 'bg-black text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Ban className="w-4 h-4 text-rose-500" />
            <span>Block List & Banned Accounts ({blockedUsers.length})</span>
          </button>
        </div>

        {/* Search & Severity Filter */}
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phone, name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 text-xs text-black pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 focus:outline-none focus:border-black font-semibold"
            />
          </div>

          {activeSubTab === 'reports' && (
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-stone-50 text-xs text-black p-1.5 rounded-xl border border-stone-300 font-bold focus:outline-none"
            >
              <option value="ALL">All Severity</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          )}
        </div>
      </div>

      {/* VIEW 1: USER REPORTS & FLAGGED ACTIVITY */}
      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-300 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-300 text-xs font-sans text-black uppercase tracking-wider bg-stone-100 font-extrabold">
                    <th className="py-3 px-4">Report Details & Type</th>
                    <th className="py-3 px-4">Flagged Customer</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs font-sans">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-4 max-w-xs">
                        <span className="font-mono text-[10px] font-extrabold bg-stone-200 text-black px-2 py-0.5 rounded mr-2">
                          {report.reportType}
                        </span>
                        <p className="font-semibold text-black mt-1 text-xs">{report.description}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-black font-serif text-sm">{report.userName}</p>
                        <p className="text-black font-mono font-extrabold flex items-center gap-1 text-xs mt-0.5">
                          <Phone className="w-3 h-3 text-[#CB9700]" /> {report.userPhone}
                        </p>
                        <p className="text-stone-600 font-medium text-[11px]">{report.userEmail}</p>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                            report.severity === 'HIGH'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : report.severity === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-stone-100 text-stone-800 border border-stone-300'
                          }`}
                        >
                          {report.severity}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-stone-700">
                        {report.reportedAt}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold ${
                            report.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-900 border border-amber-300'
                              : report.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {report.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleBlockUserFromReport(report)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                                title="Block User & Phone Number"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Block User</span>
                              </button>

                              <button
                                onClick={() => handleResolveReport(report.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                title="Mark Resolved"
                              >
                                Resolve
                              </button>

                              <button
                                onClick={() => handleDismissReport(report.id)}
                                className="px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                              >
                                Dismiss
                              </button>
                            </>
                          )}

                          {report.status !== 'PENDING' && (
                            <span className="text-[11px] font-mono text-stone-500 italic">No action needed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BLOCK LIST & BANNED ACCOUNTS */}
      {activeSubTab === 'blocklist' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-300 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-300 text-xs font-sans text-black uppercase tracking-wider bg-stone-100 font-extrabold">
                    <th className="py-3 px-4">Banned Patron</th>
                    <th className="py-3 px-4">Blocked Phone / Email</th>
                    <th className="py-3 px-4">Reason For Ban</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Banned Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs font-sans">
                  {filteredBlocked.map((blocked) => (
                    <tr key={blocked.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-900 border border-rose-300 flex items-center justify-center font-serif font-bold text-sm">
                            {blocked.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-black font-serif text-sm">{blocked.userName}</p>
                            <span className="text-[10px] font-mono text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              Banned Account
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono">
                        <p className="text-black font-extrabold flex items-center gap-1.5 text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex">
                          <Phone className="w-3.5 h-3.5 text-black" /> {blocked.userPhone}
                        </p>
                        <p className="text-stone-700 font-semibold mt-1 text-[11px]">{blocked.userEmail}</p>
                      </td>

                      <td className="py-4 px-4 text-stone-900 font-semibold max-w-xs">
                        {blocked.blockedReason}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-stone-700">
                        {blocked.ipAddress}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-stone-700">
                        {blocked.blockedDate}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleUnblockUser(blocked.id, blocked.userName)}
                          className="px-3 py-1.5 rounded-lg bg-black hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          Unblock Customer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Block Customer Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="text-xl font-serif font-bold text-black flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-600" /> Block Customer & Phone
              </h3>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-stone-500 hover:text-black font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleManualBlockSubmit} className="space-y-4">
              <div>
                <label className="type-label text-xs font-sans text-stone-900 font-bold block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sameer Verma"
                  value={blockForm.userName}
                  onChange={(e) => setBlockForm({ ...blockForm, userName: e.target.value })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="type-label text-xs font-sans text-stone-900 font-bold block mb-1">
                  Phone Number to Block *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={blockForm.userPhone}
                  onChange={(e) => setBlockForm({ ...blockForm, userPhone: e.target.value })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="type-label text-xs font-sans text-stone-900 font-bold block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={blockForm.userEmail}
                  onChange={(e) => setBlockForm({ ...blockForm, userEmail: e.target.value })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="type-label text-xs font-sans text-stone-900 font-bold block mb-1">
                  Reason for Block
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the security or fraud reason..."
                  value={blockForm.blockedReason}
                  onChange={(e) => setBlockForm({ ...blockForm, blockedReason: e.target.value })}
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none font-semibold"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-700 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                >
                  Block Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
