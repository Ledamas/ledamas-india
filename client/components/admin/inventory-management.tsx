'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Building2,
  Warehouse,
  AlertTriangle,
  Plus,
  Search,
  XCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/products';

export interface InventoryItem {
  id: string;
  batchNumber: string;
  productName: string;
  category: string;
  officeStock: number;
  warehouseStock: number;
  damagedStock: number;
  expiryDate: string;
  lowStockThreshold: number;
  location: string;
}

// Map real PRODUCTS into inventory batch records (deterministic for SSR/Hydration safety)
const INITIAL_INVENTORY: InventoryItem[] = PRODUCTS.map((prod, idx) => ({
  id: `inv-${prod.id}`,
  batchNumber: `BATCH-2026-${100 + idx}`,
  productName: prod.name,
  category: prod.category,
  officeStock: 15 + ((idx * 7) % 35),
  warehouseStock: 80 + ((idx * 23) % 120),
  damagedStock: (idx % 4 === 0) ? 1 : 0,
  expiryDate: `2027-0${(idx % 9) + 1}-15`,
  lowStockThreshold: 40,
  location: `Warehouse Vault - Rack ${String.fromCharCode(65 + (idx % 4))}${idx + 1}`,
}));

export const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAlert, setFilterAlert] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const filteredInventory = inventory.filter((item) => {
    const matchesQuery =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const isLowStock = item.officeStock + item.warehouseStock <= item.lowStockThreshold;
    return filterAlert ? matchesQuery && isLowStock : matchesQuery;
  });

  const totalOfficeStock = inventory.reduce((sum, item) => sum + item.officeStock, 0);
  const totalWarehouseStock = inventory.reduce((sum, item) => sum + item.warehouseStock, 0);
  const totalDamagedStock = inventory.reduce((sum, item) => sum + item.damagedStock, 0);
  const lowStockCount = inventory.filter(
    (item) => item.officeStock + item.warehouseStock <= item.lowStockThreshold
  ).length;

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setInventory(
      inventory.map((item) => (item.id === selectedItem.id ? selectedItem : item))
    );
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
            📦 Multi-Location Inventory & Stock Batches
          </h2>
          <p className="type-body text-stone-600 text-sm mt-1">
            Tracking Office Stock, Central Warehouse Stock, Damaged Logs, and Expiry Dates across all {inventory.length} SKUs.
          </p>
        </div>

        <button
          onClick={() => {
            const newItem: InventoryItem = {
              id: `inv-new-${Date.now()}`,
              batchNumber: `BATCH-2026-${Math.floor(200 + Math.random() * 800)}`,
              productName: PRODUCTS[0]?.name || 'New Production Batch',
              category: 'Kunafa Chocolate',
              officeStock: 40,
              warehouseStock: 160,
              damagedStock: 0,
              expiryDate: '2027-08-30',
              lowStockThreshold: 30,
              location: 'Warehouse Vault Alpha - Rack A1',
            };
            setInventory([newItem, ...inventory]);
          }}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-black hover:bg-stone-800 text-white font-sans text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#CB9700]" />
          <span>Register New Batch</span>
        </button>
      </div>

      {/* Metric Cards (4 Cards - White & Black Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[#CB9700]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-sans font-medium">Office Headroom Stock</p>
            <h3 className="text-2xl font-bold font-mono text-black">{totalOfficeStock} units</h3>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center">
            <Warehouse className="w-6 h-6 text-[#CB9700]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-sans font-medium">Central Warehouse Stock</p>
            <h3 className="text-2xl font-bold font-mono text-black">{totalWarehouseStock} units</h3>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-sans font-medium">Damaged Stock Logged</p>
            <h3 className="text-2xl font-bold font-mono text-rose-600">{totalDamagedStock} units</h3>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-sans font-medium">Low-Stock Warnings</p>
            <h3 className="text-2xl font-bold font-mono text-amber-600">{lowStockCount} SKUs</h3>
          </div>
        </div>
      </div>

      {/* Toolbar & Low-Stock Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batch number or SKU title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs text-black pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-black"
          />
        </div>

        <button
          onClick={() => setFilterAlert(!filterAlert)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
            filterAlert
              ? 'bg-amber-500 text-black shadow-xs'
              : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{filterAlert ? 'Showing Low Stock Only' : 'Filter Low Stock Warnings'}</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-sans text-stone-600 uppercase tracking-wider bg-stone-100">
                <th className="py-4 px-4 font-mono">Batch No.</th>
                <th className="py-4 px-4">Live SKU Name</th>
                <th className="py-4 px-4 font-mono">Office Stock</th>
                <th className="py-4 px-4 font-mono">Warehouse Stock</th>
                <th className="py-4 px-4 font-mono">Damaged</th>
                <th className="py-4 px-4">Expiry Date</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm font-sans">
              {filteredInventory.map((item) => {
                const totalAvailable = item.officeStock + item.warehouseStock;
                const isLow = totalAvailable <= item.lowStockThreshold;

                return (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-black">
                      {item.batchNumber}
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-black font-serif text-base">{item.productName}</p>
                      <p className="text-xs text-stone-500">{item.location}</p>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-black">
                      {item.officeStock} units
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-black">
                      {item.warehouseStock} units
                    </td>

                    <td className="py-4 px-4 font-mono text-rose-600 font-bold">
                      {item.damagedStock}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1.5 text-xs font-mono text-stone-700">
                        <Clock className="w-3.5 h-3.5 text-[#CB9700]" />
                        <span>{item.expiryDate}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {isLow && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Low Stock
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-black text-xs font-bold transition-colors cursor-pointer border border-stone-300"
                        >
                          Adjust Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-black">Adjust Batch Stock Levels</h3>
                <p className="text-xs text-stone-600 font-mono">{selectedItem.batchNumber} - {selectedItem.productName}</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-stone-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="space-y-4">
              <div>
                <label className="type-label text-xs font-sans text-stone-700 block mb-1">Office Stock Units</label>
                <input
                  type="number"
                  value={selectedItem.officeStock}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, officeStock: Number(e.target.value) })
                  }
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="type-label text-xs font-sans text-stone-700 block mb-1">Warehouse Stock Units</label>
                <input
                  type="number"
                  value={selectedItem.warehouseStock}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, warehouseStock: Number(e.target.value) })
                  }
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="type-label text-xs font-sans text-stone-700 block mb-1">Damaged Stock Count</label>
                <input
                  type="number"
                  value={selectedItem.damagedStock}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, damagedStock: Number(e.target.value) })
                  }
                  className="w-full bg-stone-50 text-xs text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-sans text-stone-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-black text-white font-bold text-xs"
                >
                  Save Stock Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
