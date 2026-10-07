import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function NotificationsManagement() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalSmsSent: 0,
    totalEmailSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/notifications', {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setStats(data.data.stats || {});
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleResend = async (id: string) => {
    if (!window.confirm('Are you sure you want to resend this notification?')) return;
    
    setResendingId(id);
    try {
      const res = await fetch(`/api/v1/admin/notifications/${id}/resend`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert('Notification resent successfully');
        fetchNotifications();
      } else {
        alert('Failed to resend: ' + data.message);
      }
    } catch (error) {
      alert('Error resending notification');
    } finally {
      setResendingId(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3" /> Failed</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications &amp; Communications</h1>
          <p className="text-sm text-slate-500 mt-1">Manage automated SMS and Email communications sent to customers.</p>
        </div>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium">Total SMS Sent</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalSmsSent || 0}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Mail className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-medium">Total Emails Sent</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalEmailSent || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-medium">Delivered</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.delivered || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-medium">Failed</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.failed || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-medium">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.pending || 0}</p>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Recent Notifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Date &amp; Time</th>
                <th className="px-6 py-4 font-medium">Channel</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Customer / Recipient</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading notifications...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No notifications sent yet.
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(notif.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {notif.channel === 'SMS' ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-medium">
                          <MessageSquare className="w-3.5 h-3.5" /> SMS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2 py-1 rounded text-xs font-medium">
                          <Mail className="w-3.5 h-3.5" /> EMAIL
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700">{notif.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{notif.user?.name || 'Guest'}</span>
                        <span className="text-xs text-slate-500">{notif.recipient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {notif.order?.orderNumber ? (
                        <span className="text-indigo-600 font-medium hover:underline cursor-pointer">#{notif.order.orderNumber}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={notif.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {notif.status === 'FAILED' && (
                        <button
                          onClick={() => handleResend(notif.id)}
                          disabled={resendingId === notif.id}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {resendingId === notif.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          Resend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
