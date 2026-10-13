'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Printer, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/context/auth-context';

export default function InvoicePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    billedToName: '',
    billedToAddress: '',
    billedToEmail: '',
    invoiceDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    fromName: 'Le Damas Sweets',
    fromAddress: `Unit no. 514, 5th Floor, Manglam Paradise Mall, Sec-3, Rohini, New Delhi - 110085`,
    items: [] as any[],
    notes: 'Thank you for choosing Le Damas.'
  });

  useEffect(() => {
    setMounted(true);
    try {
      const data = localStorage.getItem('ledamas_last_order_invoice');
      if (data) {
        const order = JSON.parse(data);

        if (order.customer?.firstName === 'Valued' && order.customer?.lastName === 'Customer' && user) {
          order.customer.firstName = user.name?.split(' ')[0] || '';
          order.customer.lastName = user.name?.split(' ').slice(1).join(' ') || '';
        }
        if (order.customer?.address === 'N/A' && user?.savedAddress) {
          order.customer.address = `${user.savedAddress.street || ''} ${user.savedAddress.apartment || ''}`.trim();
          order.customer.city = user.savedAddress.city || '';
          order.customer.state = user.savedAddress.state || '';
          order.customer.pincode = user.savedAddress.pincode || '';
        }

        setInvoice({
          invoiceNumber: `NO. ${order.orderNumber || 'LD-0001'}`,
          billedToName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || user?.name || '',
          billedToAddress: `${order.customer?.address || ''}\n${order.customer?.city || ''}, ${order.customer?.state || ''} ${order.customer?.pincode || ''}`.replace('N/A', '').trim() || '',
          billedToEmail: order.customer?.email !== 'N/A' ? order.customer?.email : (user?.email || user?.phone || ''),
          invoiceDate: new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          fromName: 'Le Damas Sweets',
          fromAddress: `Unit no. 514, 5th Floor, Manglam Paradise Mall, Sec-3, Rohini, New Delhi - 110085`,
          items: order.items?.map((item: any, i: number) => ({
            id: i,
            name: item.productName || item.product?.name || 'Item',
            desc: item.variantName || item.variant?.name || item.variant?.weight || '',
            qty: item.quantity || 1,
            price: item.price ?? (item.variant ? item.variant.price : (item.product?.price || 0))
          })) || [],
          notes: 'Thank you for choosing Le Damas.'
        });
      } else if (user) {
        setInvoice(prev => ({
          ...prev,
          billedToName: user.name || '',
          billedToEmail: user.email || user.phone || '',
          billedToAddress: user.savedAddress ? `${user.savedAddress.street || ''} ${user.savedAddress.apartment || ''}\n${user.savedAddress.city || ''}, ${user.savedAddress.state || ''} ${user.savedAddress.pincode || ''}`.trim() : '',
          invoiceDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        }));
      }
    } catch (e) { }
  }, [user]);

  if (!mounted) return null;

  const grandTotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-start overflow-x-auto py-10 print:py-0 print:bg-white font-sans text-[#2a2622]">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        .font-pinyon { font-family: 'Pinyon Script', cursive; }

        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background: white; 
          }
          .print-hide { display: none !important; }
        }
      `}} />

      {/* Floating Action Buttons */}
      <div className="fixed top-6 right-6 flex flex-col gap-3 print-hide z-50">
        <button onClick={() => router.back()} className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-50 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={() => window.print()} className="bg-[#12b5aa] text-white p-3 rounded-full shadow-lg hover:bg-[#0b857d] flex items-center justify-center">
          <Printer className="w-5 h-5" />
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="min-w-[210mm] max-w-[210mm] w-[210mm] min-h-[297mm] bg-[#fbf8f1] shadow-2xl relative flex flex-col box-border font-dm overflow-hidden print:shadow-none print:min-w-full print:w-full print:max-w-full print:h-[297mm]">

        {/* Top Accent Strip */}
        <div className="flex h-4 w-full">
          <div className="bg-[#12b5aa] w-[70%] h-full"></div>
          <div className="bg-[#e0a21b] w-[30%] h-full"></div>
        </div>

        {/* Content Wrapper */}
        <div className="px-16 pt-12 pb-10 flex-1 flex flex-col relative">

          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div className="w-48">
              <Image
                src="/Le-Damas-Sweets-Logo-enhanced.png"
                alt="Le Damas"
                width={200}
                height={84}
                className="h-[84px] w-auto object-contain"
              />
            </div>
            <div className="text-right">
              <h1 className="font-playfair text-6xl tracking-widest text-[#2a2622] mb-2 uppercase">INVOICE</h1>
              <p className="text-right text-[#8a8277] font-dm text-sm tracking-widest uppercase">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#e6dfd1] mb-12"></div>

          {/* Three Columns Info */}
          <div className="grid grid-cols-3 gap-8 mb-16">
            {/* Billed To */}
            <div>
              <h3 className="text-[#0b857d] text-xs font-bold tracking-widest uppercase mb-4">BILLED TO</h3>
              <p className="text-[#2a2622] font-medium mb-1 select-none">{invoice.billedToName}</p>
              <p className="text-[#2a2622] whitespace-pre-line mb-1 select-none">{invoice.billedToAddress}</p>
              <p className="text-[#2a2622] select-none">{invoice.billedToEmail}</p>
            </div>

            {/* Dates */}
            <div>
              <div className="mb-6">
                <h3 className="text-[#0b857d] text-xs font-bold tracking-widest uppercase mb-4">INVOICE DATE</h3>
                <p className="text-[#2a2622] select-none">{invoice.invoiceDate}</p>
              </div>
              <div>
                <h3 className="text-[#0b857d] text-xs font-bold tracking-widest uppercase mb-4">DUE DATE</h3>
                <p className="text-[#2a2622] select-none">{invoice.dueDate}</p>
              </div>
            </div>

            {/* From */}
            <div>
              <h3 className="text-[#0b857d] text-xs font-bold tracking-widest uppercase mb-4">FROM</h3>
              <p className="text-[#2a2622] font-medium mb-1 select-none">{invoice.fromName}</p>
              <p className="text-[#2a2622] whitespace-pre-line select-none">{invoice.fromAddress}</p>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[#e6dfd1] mb-6">
            <div className="col-span-6 text-[#8a8277] text-[10px] font-bold tracking-widest uppercase">ITEM</div>
            <div className="col-span-2 text-center text-[#8a8277] text-[10px] font-bold tracking-widest uppercase">QTY</div>
            <div className="col-span-2 text-right text-[#8a8277] text-[10px] font-bold tracking-widest uppercase">UNIT PRICE</div>
            <div className="col-span-2 text-right text-[#8a8277] text-[10px] font-bold tracking-widest uppercase">TOTAL</div>
          </div>

          {/* Table Rows */}
          <div className="flex-1">
            {invoice.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 py-4 border-b border-[#e6dfd1] items-start">
                <div className="col-span-6 pr-4">
                  <p className="text-[#2a2622] font-medium select-none">{item.name}</p>
                  {item.desc ? <p className="text-[#8a8277] text-sm mt-1 select-none">{item.desc}</p> : null}
                </div>
                <div className="col-span-2 text-center pt-1">
                  <p className="text-[#2a2622] select-none">{item.qty}</p>
                </div>
                <div className="col-span-2 text-right pt-1">
                  <p className="text-[#2a2622] select-none">{item.price}</p>
                </div>
                <div className="col-span-2 text-right pt-1 text-[#2a2622] select-none">
                  {formatCurrency(item.qty * item.price)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals Block */}
          <div className="mt-8 pt-8 border-t-2 border-[#e6dfd1] flex justify-end">
            <div className="flex justify-between items-center w-64">
              <span className="font-playfair text-2xl font-bold tracking-widest text-[#2a2622]">TOTAL</span>
              <span className="font-playfair text-2xl font-bold text-[#0b857d]">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="h-[1px] w-full bg-[#e6dfd1] mt-8 mb-16"></div>

          {/* Footer Notes and Contacts */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-[#0b857d] text-xs font-bold tracking-widest uppercase mb-4">NOTES</h3>
              <p className="text-[#8a8277] text-sm select-none">{invoice.notes}</p>
              <div className="font-pinyon text-5xl text-[#e0a21b] mt-4 -ml-2">thank you</div>
            </div>

            <div className="text-right text-sm text-[#8a8277] space-y-1">
              <p className="font-medium text-[#2a2622]">ledamas.in</p>
              <p>info@ledamas.in</p>
              <p>+91 93112 28575</p>
            </div>
          </div>

        </div>

        {/* Bottom Teal Band */}
        <div className="bg-[#12b5aa] w-full py-6 text-center mt-auto">
          <p className="text-white text-xs tracking-[0.2em] uppercase font-medium">LE DAMAS · DELICIOUS SINCE 1951</p>
        </div>

      </div>
    </div>
  );
}
