'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicePage() {
  const [order, setOrder] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    try {
      const data = localStorage.getItem('ledamas_last_order_invoice');
      if (data) {
        setOrder(JSON.parse(data));
        // Small delay to ensure the page renders properly before printing
        setTimeout(() => {
          window.print();
        }, 800);
      }
    } catch (e) {}
  }, []);

  if (!mounted) return null;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">No Invoice Found</h1>
          <p className="text-gray-500 mb-6">We couldn't find your recent order details.</p>
          <button onClick={() => router.push('/')} className="bg-[#3D2314] text-white px-6 py-2 rounded-full text-sm font-semibold cursor-pointer">
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const { customer, items, orderNumber, date, subtotal, discount, total, isCod } = order;

  return (
    <div className="min-h-screen bg-white text-black font-sans p-8 md:p-12 max-w-4xl mx-auto print:p-0 print:max-w-full">
      <div className="flex justify-between items-start mb-12 border-b-2 border-[#3D2314] pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#3D2314] tracking-widest">LE DAMAS</h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Luxury Chocolate</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">Invoice</h2>
          <p className="text-sm font-mono mt-2 text-gray-600">Order: #{orderNumber}</p>
          <p className="text-sm font-mono text-gray-600">Date: {new Date(date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b pb-2">Billed To</h3>
          <div className="text-sm space-y-1 text-gray-800">
            <p className="font-bold">{customer.firstName} {customer.lastName}</p>
            <p>{customer.email}</p>
            <p>{customer.phone}</p>
            {customer.alternatePhone && <p>Alt: {customer.alternatePhone}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b pb-2">Shipped To</h3>
          <div className="text-sm space-y-1 text-gray-800">
            <p>{customer.address}</p>
            {customer.apartment && <p>{customer.apartment}</p>}
            <p>{customer.city}, {customer.state} {customer.pincode}</p>
            <p className="mt-2 font-semibold text-gray-600">Payment: <span className="text-[#3D2314]">{isCod ? 'Cash on Delivery' : 'Prepaid Online'}</span></p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 w-1/2">Item Description</th>
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Qty</th>
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Price</th>
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => {
              const itemPrice = item.variant ? item.variant.price : item.product.price;
              const variantName = item.variant?.name || item.variant?.weight;
              return (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-4 text-sm font-semibold text-gray-800">
                    {item.product.name}
                    {variantName && <span className="block text-xs text-gray-500 font-normal mt-0.5">{variantName}</span>}
                  </td>
                  <td className="py-4 text-sm text-gray-600 text-center font-mono">{item.quantity}</td>
                  <td className="py-4 text-sm text-gray-600 text-right font-mono">₹{itemPrice.toLocaleString('en-IN')}</td>
                  <td className="py-4 text-sm text-gray-800 font-bold text-right font-mono">₹{(itemPrice * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-16">
        <div className="w-full sm:w-1/2 md:w-1/3 space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount:</span>
              <span className="font-mono">- ₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping:</span>
            <span className="font-mono">Free</span>
          </div>
          <div className="flex justify-between items-center border-t-2 border-gray-800 pt-3 mt-3">
            <span className="font-bold text-gray-800">Total:</span>
            <span className="font-bold text-lg text-gray-800 font-mono">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 border-t pt-8">
        <p>Thank you for shopping with LE DAMAS.</p>
        <p className="mt-1">For any queries regarding your order, please contact support@ledamas.in</p>
      </div>

      <div className="mt-12 text-center print:hidden">
        <button onClick={() => window.print()} className="bg-[#3D2314] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#5A3822] transition-colors shadow-lg cursor-pointer">
          Print Invoice Again
        </button>
      </div>
    </div>
  );
}
