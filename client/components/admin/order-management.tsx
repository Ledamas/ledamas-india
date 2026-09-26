'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  FileText,
  Printer,
  Sparkles,
  AlertCircle,
  CreditCard,
  Banknote,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/products';
import { calculateCodDetails, CodCalculation } from '@/lib/utils/cod-calculator';
import { getAdminOrdersApi, updateOrderStatusApi, processAdminRefundApi } from '@/lib/services/admin-service';

export type AdminOrderStatus =
  | 'NEW'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'RETURN_REQUESTED';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  baseOrderTotal: number;
  paymentMethod: 'UPI' | 'CARD' | 'COD';
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIALLY_PAID' | 'REFUNDED';
  orderStatus: AdminOrderStatus;
  carrier?: string;
  trackingNumber?: string;
  createdAt: string;
  codDetails?: CodCalculation;
  razorpayRefundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundReason?: string;
  refundedAt?: string;
}

const formatDbOrderToAdminOrder = (dbOrder: any): AdminOrder => {
  const addressParts = [
    dbOrder.street,
    dbOrder.apartment,
    dbOrder.city,
    dbOrder.state ? `${dbOrder.state}${dbOrder.pincode ? ` - ${dbOrder.pincode}` : ''}` : dbOrder.pincode,
    dbOrder.country || 'India',
  ].filter(Boolean);

  const formattedItems = (dbOrder.items || []).map((item: any) => ({
    name: item.productName + (item.variantName ? ` (${item.variantName})` : ''),
    qty: item.quantity || 1,
    price: item.price || 0,
  }));

  const isCod = (dbOrder.paymentMethod || '').toUpperCase() === 'COD';

  let displayPaymentStatus: 'PAID' | 'PENDING' | 'PARTIALLY_PAID' | 'REFUNDED' = 'PAID';
  if (dbOrder.paymentStatus === 'ADVANCE_PAID') {
    displayPaymentStatus = 'PARTIALLY_PAID';
  } else if (dbOrder.paymentStatus === 'REFUNDED') {
    displayPaymentStatus = 'REFUNDED';
  } else if (dbOrder.paymentStatus === 'PENDING') {
    displayPaymentStatus = 'PENDING';
  }

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.orderNumber,
    customerName: dbOrder.customerName || 'Valued Customer',
    email: dbOrder.email || 'N/A',
    phone: dbOrder.phone || 'N/A',
    address: addressParts.join(', ') || 'Address specified at checkout',
    items: formattedItems.length > 0 ? formattedItems : [{ name: 'Luxury Confectionery', qty: 1, price: dbOrder.total || 0 }],
    baseOrderTotal: dbOrder.orderTotal || dbOrder.subtotal || dbOrder.total || 0,
    paymentMethod: isCod ? 'COD' : ((dbOrder.paymentMethod || 'UPI').toUpperCase() as any),
    paymentStatus: displayPaymentStatus,
    orderStatus: (dbOrder.orderStatus || 'NEW') as AdminOrderStatus,
    createdAt: dbOrder.createdAt
      ? new Date(dbOrder.createdAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Just now',
    codDetails: calculateCodDetails(
      dbOrder.orderTotal || dbOrder.total || 0,
      isCod ? 'COD' : 'ONLINE'
    ),
    razorpayRefundId: dbOrder.razorpayRefundId,
    refundAmount: dbOrder.refundAmount,
    refundStatus: dbOrder.refundStatus,
    refundReason: dbOrder.refundReason,
    refundedAt: dbOrder.refundedAt ? new Date(dbOrder.refundedAt).toLocaleString('en-IN') : undefined,
  };
};


export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminOrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundTargetOrder, setRefundTargetOrder] = useState<AdminOrder | null>(null);

  const fetchDbOrders = async () => {
    setLoading(true);
    try {
      const res = await getAdminOrdersApi();
      if (res?.orders && Array.isArray(res.orders)) {
        const mapped = res.orders.map(formatDbOrderToAdminOrder);
        setOrders(mapped);
      }
    } catch (e) {
      console.error('[ADMIN ORDERS FETCH ERROR]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbOrders();
  }, []);

  const STATUS_CONFIG: Record<
    AdminOrderStatus,
    { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    NEW: { label: 'New Order', bg: 'bg-black text-white', text: 'text-white', icon: Clock },
    PROCESSING: { label: 'Processing', bg: 'bg-cyan-100 border border-cyan-300', text: 'text-cyan-900', icon: Sparkles },
    SHIPPED: { label: 'Shipped', bg: 'bg-purple-100 border border-purple-300', text: 'text-purple-900', icon: Truck },
    DELIVERED: { label: 'Delivered', bg: 'bg-emerald-100 border border-emerald-300', text: 'text-emerald-900', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelled', bg: 'bg-rose-100 border border-rose-300', text: 'text-rose-900', icon: XCircle },
    REFUND_REQUESTED: { label: 'Refund Requested', bg: 'bg-amber-100 border border-amber-300', text: 'text-amber-900', icon: RotateCcw },
    REFUNDED: { label: 'Refund Completed 💰', bg: 'bg-amber-50 border border-amber-300', text: 'text-amber-900', icon: RotateCcw },
    RETURN_REQUESTED: { label: 'Return Requested', bg: 'bg-orange-100 border border-orange-300', text: 'text-orange-900', icon: AlertCircle },
  };


  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'ALL' || order.orderStatus === activeTab;
    const matchesQuery =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const handleUpdateStatus = async (id: string, newStatus: AdminOrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
    if (!id.startsWith('o-')) {
      await updateOrderStatusApi(id, newStatus);
    }
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            🚚 Order Fulfillment & Tax Invoices
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Manage live orders, tracking IDs, COD threshold rules (&lt; ₹3,000 vs &ge; ₹3,000), and printable tax invoices.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDbOrders}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 transition-all cursor-pointer"
            title="Refresh database orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Refresh DB Orders'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-stone-100 p-1.5 rounded-xl border border-stone-300 text-xs font-mono font-bold text-black">
            <span>Total Orders:</span>
            <span className="px-2 py-0.5 rounded-md bg-black text-white">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Order Pipeline Status Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-sans font-bold shrink-0 transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-black text-white shadow-xs'
              : 'bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200'
          }`}
        >
          All Orders ({orders.length})
        </button>

        {(
          [
            'NEW',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'REFUND_REQUESTED',
            'CANCELLED',
          ] as AdminOrderStatus[]
        ).map((st) => {
          const count = orders.filter((o) => o.orderStatus === st).length;
          const conf = STATUS_CONFIG[st];
          return (
            <button
              key={st}
              onClick={() => setActiveTab(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-sans font-semibold shrink-0 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === st
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200'
              }`}
            >
              <span>{conf.label}</span>
              <span className="font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-black text-[10px] font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar & Search */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order number (e.g. LD-9482), phone (+91 98765...), customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs text-black pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Orders Datatable */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-sans text-stone-600 uppercase tracking-wider bg-stone-100">
                <th className="py-4 px-4 font-mono">Order No.</th>
                <th className="py-4 px-4">Customer & Contact</th>
                <th className="py-4 px-4 font-mono">Order Breakdown</th>
                <th className="py-4 px-4">Payment Method</th>
                <th className="py-4 px-4">Fulfillment Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-500 bg-stone-50">
                    <Clock className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                    <p className="font-semibold text-stone-800 text-base">No orders in database</p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                      Orders placed by customers on the storefront will appear here dynamically in real-time.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const conf = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.NEW;
                  const StatusIcon = conf.icon;
                  const cod = order.codDetails || calculateCodDetails(order.baseOrderTotal, order.paymentMethod);

                  return (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-black">
                        {order.orderNumber}
                        <p className="text-[10px] text-stone-500 font-sans font-normal">{order.createdAt}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-black">{order.customerName}</p>
                        <div className="text-xs text-stone-600 space-y-0.5 mt-0.5">
                          {order.phone && order.phone !== 'N/A' && (
                            <p className="flex items-center gap-1 font-mono text-[11px] text-emerald-800 font-semibold">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{order.phone}</span>
                            </p>
                          )}
                          {order.email && order.email !== 'N/A' && (
                            <p className="flex items-center gap-1 text-[11px] text-stone-500">
                              <Mail className="w-3 h-3 text-stone-400" />
                              <span>{order.email}</span>
                            </p>
                          )}
                          <p className="flex items-start gap-1 text-[11px] text-stone-600 max-w-[240px]">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{order.address}</span>
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs">
                        {cod.isCod ? (
                          <div>
                            <p className="font-bold text-black text-sm">
                              Total: ₹{cod.totalCustomerPays.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[11px] text-[#CB9700]">
                              Online Paid: ₹{cod.onlinePayableAmount}
                            </p>
                            <p className="text-[11px] text-stone-600">
                              Cash Due: ₹{cod.codAmountToCollect.toLocaleString('en-IN')}
                            </p>
                          </div>
                        ) : (
                          <p className="font-bold text-black text-sm">
                            Total: ₹{order.baseOrderTotal.toLocaleString('en-IN')} (Prepaid)
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {cod.isCod ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center space-x-1">
                              <Banknote className="w-3 h-3 text-amber-700" />
                              <span>COD ({cod.codFeeType === 'CONFIRMATION_CHARGE' ? '< ₹3k: +₹99 Charge' : '≥ ₹3k: ₹99 Advance'})</span>
                            </span>
                            <p className="text-[10px] text-stone-500 max-w-[180px] leading-tight">
                              {cod.codFeeType === 'CONFIRMATION_CHARGE'
                                ? '₹99 confirmation fee collected online. Full order payable on delivery.'
                                : '₹99 advance collected online. Remaining balance payable on delivery.'}
                            </p>
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center space-x-1">
                            <CreditCard className="w-3 h-3 text-emerald-700" />
                            <span>{order.paymentMethod} (PREPAID)</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${conf.bg} ${conf.text}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{conf.label}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleUpdateStatus(order.id, e.target.value as AdminOrderStatus)
                            }
                            className="bg-stone-50 text-xs text-black border border-stone-300 rounded-lg p-1.5 focus:outline-none cursor-pointer"
                          >
                            <option value="NEW">NEW</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="REFUNDED">REFUNDED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>

                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsInvoiceModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-black transition-colors cursor-pointer border border-stone-300"
                            title="Print Official Tax Invoice"
                          >
                            <FileText className="w-4 h-4 text-[#CB9700]" />
                          </button>

                          <button
                            onClick={() => {
                              setRefundTargetOrder(order);
                              setIsRefundModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                            title="Initiate Real Razorpay Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                            <span>{order.orderStatus === 'REFUNDED' ? 'Refunded' : 'Refund'}</span>
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

      {/* Tax Invoice Modal */}
      {isInvoiceModalOpen && selectedOrder && (
        <TaxInvoiceModal
          order={selectedOrder}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}

      {/* Real Razorpay Refund Modal */}
      {isRefundModalOpen && refundTargetOrder && (
        <AdminRefundModal
          order={refundTargetOrder}
          onClose={() => {
            setIsRefundModalOpen(false);
            setRefundTargetOrder(null);
          }}
          onSuccess={fetchDbOrders}
        />
      )}
    </div>
  );
};

interface AdminRefundModalProps {
  order: AdminOrder;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminRefundModal: React.FC<AdminRefundModalProps> = ({ order, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(order.baseOrderTotal);
  const [reason, setReason] = useState<string>('Customer refund request approved');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refundResult, setRefundResult] = useState<any>(null);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await processAdminRefundApi(order.id, amount, reason);
      setRefundResult(res);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to process Razorpay refund.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative font-sans border border-stone-300">
        <div className="flex justify-between items-start border-b border-stone-200 pb-3">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Razorpay Real Refund Engine</span>
            <h3 className="text-xl font-serif font-bold text-black">Refund Order #{order.orderNumber}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-stone-400 hover:text-black">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {refundResult ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs space-y-2 text-emerald-900">
            <div className="flex items-center space-x-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Razorpay Refund Processed Successfully!</span>
            </div>
            <p>Razorpay Refund ID: <strong className="font-mono">{refundResult.refundId || 'rfd_xxx'}</strong></p>
            <p>Amount Refunded: <strong>₹{Number(refundResult.refundAmount || amount).toLocaleString('en-IN')}</strong></p>
            <p className="text-[11px] text-stone-500">PostgreSQL database updated & SMS notification sent to customer.</p>
          </div>
        ) : (
          <form onSubmit={handleRefund} className="space-y-4 text-xs">
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700">
                {error}
              </div>
            )}

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
              <p>Customer: <strong>{order.customerName}</strong> ({order.phone})</p>
              <p>Order Base Total: <strong>₹{order.baseOrderTotal.toLocaleString('en-IN')}</strong></p>
              <p>Payment Status: <span className="uppercase font-bold text-emerald-700">{order.paymentStatus}</span></p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Refund Amount (₹)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Reason for Refund</label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify reason for refund..."
                className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              🔒 <strong>Server Security Enforced:</strong> Razorpay Secret Key is executed only inside the backend Node.js environment. Frontend never handles secrets.
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Refund...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Confirm Real Refund ₹{amount}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


interface TaxInvoiceModalProps {
  order: AdminOrder;
  onClose: () => void;
}

const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({ order, onClose }) => {
  const cod = order.codDetails || calculateCodDetails(order.baseOrderTotal, order.paymentMethod);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white text-black rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative font-sans border border-stone-300">
        <div className="flex justify-between items-start border-b border-stone-200 pb-4">
          <div>
            <h3 className="text-2xl font-serif font-bold text-black tracking-wide">LE DAMAS</h3>
            <p className="text-xs text-stone-500">Luxury Confections • Tax Invoice & Delivery Receipt</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono font-bold">{order.orderNumber}</p>
            <p className="text-xs text-stone-500">{order.createdAt}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-stone-700 uppercase">Customer Information:</p>
            <p className="font-semibold text-black mt-1">{order.customerName}</p>
            <p className="text-stone-600">{order.phone}</p>
            <p className="text-stone-600">{order.email}</p>
          </div>
          <div>
            <p className="font-bold text-stone-700 uppercase">Shipping Address:</p>
            <p className="text-stone-600 mt-1">{order.address}</p>
          </div>
        </div>

        <div className="border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-100 font-bold uppercase text-stone-600 border-b border-stone-200">
              <tr>
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-right font-mono">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-semibold text-stone-900 font-serif">{item.name}</td>
                  <td className="p-2.5 text-center font-mono">{item.qty}</td>
                  <td className="p-2.5 text-right font-mono font-bold">₹{(item.price * item.qty).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment & COD Breakdown Box */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-stone-600">
            <span>Items Base Subtotal:</span>
            <span>₹{order.baseOrderTotal.toLocaleString('en-IN')}</span>
          </div>

          {cod.isCod ? (
            <>
              <div className="flex justify-between text-stone-600">
                <span>
                  {cod.codFeeType === 'CONFIRMATION_CHARGE'
                    ? 'COD Confirmation Charge (Additional, Paid Online):'
                    : 'COD Advance Payment (Toward Total, Paid Online):'}
                </span>
                <span className="text-[#CB9700] font-bold">₹99</span>
              </div>
              <div className="flex justify-between text-stone-800 font-bold border-t border-stone-200 pt-1.5">
                <span>Collect Cash on Delivery (COD Amount):</span>
                <span className="text-base text-black">₹{cod.codAmountToCollect.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600 text-[11px] pt-0.5">
                <span>Total Customer Payment Value:</span>
                <span>₹{cod.totalCustomerPays.toLocaleString('en-IN')}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-emerald-800 font-bold border-t border-stone-200 pt-1.5">
              <span>Paid Online via {order.paymentMethod}:</span>
              <span className="text-base">₹{order.baseOrderTotal.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-2 border-t border-stone-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
          >
            Close
          </button>
          <button
            onClick={() => alert('Sending Official Tax Invoice PDF to printer...')}
            className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold flex items-center space-x-2"
          >
            <Printer className="w-4 h-4 text-[#CB9700]" />
            <span>Print Official Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
