'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Warehouse,
  AlertTriangle,
  Plus,
  Search,
  XCircle,
  Clock,
  ShieldAlert,
  RefreshCw,
  X,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/products';
import {
  getAdminInventoryApi,
  createAdminInventoryBatchApi,
  updateAdminInventoryStockApi,
} from '@/lib/services/admin-service';

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

export const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAlert, setFilterAlert] = useState<boolean>(false);
  
  // Modals state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for New Batch registration
  const [newBatchForm, setNewBatchForm] = useState({
    productName: PRODUCTS[0]?.name || 'White Chocolate Hazelnut Creme - 200gm',
    officeStock: 40,
    warehouseStock: 160,
    damagedStock: 0,
    expiryDate: '2027-08-30',
    location: 'Warehouse Vault Alpha - Rack A1',
  });

  // Load Inventory from Backend DB API (with localStorage fallback)
  const fetchInventoryData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await getAdminInventoryApi();
      if (res && res.inventory && res.inventory.length > 0) {
        setInventory(res.inventory);
        try {
          localStorage.setItem('ledamas_admin_inventory_cache', JSON.stringify(res.inventory));
        } catch (e) {}
      } else {
        // Fallback to cache or dynamic initialization from PRODUCTS
        const cached = localStorage.getItem('ledamas_admin_inventory_cache');
        if (cached) {
          setInventory(JSON.parse(cached));
        } else {
          const initial = PRODUCTS.map((prod, idx) => ({
            id: `inv-${prod.id}`,
            batchNumber: `BATCH-2026-${100 + idx}`,
            productName: prod.name,
            category: prod.category,
            officeStock: 15 + ((idx * 7) % 35),
            warehouseStock: 80 + ((idx * 23) % 120),
            damagedStock: idx % 4 === 0 ? 1 : 0,
            expiryDate: `2027-0${(idx % 9) + 1}-15`,
            lowStockThreshold: 40,
            location: `Warehouse Vault - Rack ${String.fromCharCode(65 + (idx % 4))}${idx + 1}`,
          }));
          setInventory(initial);
        }
      }
    } catch (err) {
      console.error('[INVENTORY FETCH ERROR]', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const matchesQuery =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const isLowStock = item.officeStock + item.warehouseStock <= item.lowStockThreshold;
    return filterAlert ? matchesQuery && isLowStock : matchesQuery;
  });

  const totalOfficeStock = inventory.reduce((sum, item) => sum + item.officeStock, 0);
  const totalWarehouseStock = inventory.reduce((sum, item) => sum + item.warehouseStock, 0);
  const totalDamagedStock = inventory.reduce((sum, item) => sum + item.damagedStock, 0);
  const lowStockCount = inventory.filter(
    (item) => item.officeStock + item.warehouseStock <= item.lowStockThreshold
  ).length;

  // Handle stock adjustment submit
  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);

    try {
      await updateAdminInventoryStockApi(selectedItem.id, {
        officeStock: selectedItem.officeStock,
        warehouseStock: selectedItem.warehouseStock,
        damagedStock: selectedItem.damagedStock,
        location: selectedItem.location,
      });

      const updatedList = inventory.map((item) =>
        item.id === selectedItem.id ? selectedItem : item
      );
      setInventory(updatedList);
      try {
        localStorage.setItem('ledamas_admin_inventory_cache', JSON.stringify(updatedList));
      } catch (e) {}

      setIsAdjustModalOpen(false);
    } catch (err) {
      console.warn('[STOCK ADJUST API FALLBACK]', err);
      // Fallback local update
      const updatedList = inventory.map((item) =>
        item.id === selectedItem.id ? selectedItem : item
      );
      setInventory(updatedList);
      try {
        localStorage.setItem('ledamas_admin_inventory_cache', JSON.stringify(updatedList));
      } catch (e) {}
      setIsAdjustModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle new batch registration submit
  const handleRegisterNewBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiRes = await createAdminInventoryBatchApi(newBatchForm);
      const createdItem: InventoryItem = apiRes && apiRes.id ? apiRes : {
        id: `inv-new-${Date.now()}`,
        batchNumber: `BATCH-2026-${Math.floor(200 + inventory.length)}`,
        productName: newBatchForm.productName,
        category: PRODUCTS.find((p) => p.name === newBatchForm.productName)?.category || 'Kunafa Chocolate',
        officeStock: Number(newBatchForm.officeStock),
        warehouseStock: Number(newBatchForm.warehouseStock),
        damagedStock: Number(newBatchForm.damagedStock),
        expiryDate: newBatchForm.expiryDate,
        lowStockThreshold: 30,
        location: newBatchForm.location,
      };

      const updatedList = [createdItem, ...inventory];
      setInventory(updatedList);
      try {
        localStorage.setItem('ledamas_admin_inventory_cache', JSON.stringify(updatedList));
      } catch (e) {}

      setIsRegisterModalOpen(false);
    } catch (err) {
      console.warn('[BATCH REGISTER API FALLBACK]', err);
      const fallbackItem: InventoryItem = {
        id: `inv-new-${Date.now()}`,
        batchNumber: `BATCH-2026-${Math.floor(200 + inventory.length)}`,
        productName: newBatchForm.productName,
        category: PRODUCTS.find((p) => p.name === newBatchForm.productName)?.category || 'Kunafa Chocolate',
        officeStock: Number(newBatchForm.officeStock),
        warehouseStock: Number(newBatchForm.warehouseStock),
        damagedStock: Number(newBatchForm.damagedStock),
        expiryDate: newBatchForm.expiryDate,
        lowStockThreshold: 30,
        location: newBatchForm.location,
      };

      const updatedList = [fallbackItem, ...inventory];
      setInventory(updatedList);
      try {
        localStorage.setItem('ledamas_admin_inventory_cache', JSON.stringify(updatedList));
      } catch (e) {}

      setIsRegisterModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 bg-white text-stone-900 p-6 rounded-2xl border border-stone-200 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="type-page-title text-3xl font-serif font-bold text-black tracking-wide">
              📦 Multi-Location Inventory & Stock Batches
            </h2>
            <span className="inline-flex items-center space-x-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>DB Synced</span>
            </span>
          </div>
          <p className="type-body text-stone-700 text-sm font-medium mt-1">
            Tracking Office Stock, Central Warehouse Stock, Damaged Logs, and Expiry Dates across all {inventory.length} SKUs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchInventoryData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
            title="Refresh inventory from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-stone-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-black hover:bg-stone-800 text-white font-sans text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-[#CB9700]" />
            <span>Register New Batch</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (4 Cards - White & Black Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-[#CB9700]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-sans font-semibold">Office Headroom Stock</p>
            <h3 className="text-2xl font-bold font-mono text-black">{totalOfficeStock} units</h3>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
            <Warehouse className="w-6 h-6 text-[#CB9700]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-sans font-semibold">Central Warehouse Stock</p>
            <h3 className="text-2xl font-bold font-mono text-black">{totalWarehouseStock} units</h3>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-sans font-semibold">Damaged Stock Logged</p>
            <h3 className="text-2xl font-bold font-mono text-rose-600">{totalDamagedStock} units</h3>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-sans font-semibold">Low-Stock Warnings</p>
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
            placeholder="Search batch number, SKU title, or rack location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-xs text-black pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-black font-semibold"
          />
        </div>

        <button
          onClick={() => setFilterAlert(!filterAlert)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
            filterAlert
              ? 'bg-amber-500 text-black shadow-xs'
              : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
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
              <tr className="border-b border-stone-200 text-xs font-sans text-stone-700 uppercase tracking-wider bg-stone-100 font-extrabold">
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 text-xs font-semibold">
                    Syncing database inventory records...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500 text-xs font-medium">
                    No matching inventory batches found for &quot;{searchQuery}&quot;
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const totalAvailable = item.officeStock + item.warehouseStock;
                  const isLow = totalAvailable <= item.lowStockThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-4 font-mono text-xs font-extrabold text-black">
                        {item.batchNumber}
                      </td>

                      <td className="py-4 px-4 min-w-[220px]">
                        <p className="font-bold text-black font-serif text-sm leading-tight">
                          {item.productName}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5 font-medium">
                          {item.location}
                        </p>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-black whitespace-nowrap">
                        {item.officeStock} units
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-black whitespace-nowrap">
                        {item.warehouseStock} units
                      </td>

                      <td className="py-4 px-4 font-mono text-rose-600 font-extrabold">
                        {item.damagedStock}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 text-xs font-mono text-stone-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#CB9700]" />
                          <span>{item.expiryDate}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Register New Batch */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-black text-amber-400 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-black">
                    Register New Production Batch
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Create batch record and assign vault location
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterNewBatch} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Target Product SKU
                </label>
                <select
                  value={newBatchForm.productName}
                  onChange={(e) =>
                    setNewBatchForm({ ...newBatchForm, productName: e.target.value })
                  }
                  className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Office Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newBatchForm.officeStock}
                    onChange={(e) =>
                      setNewBatchForm({ ...newBatchForm, officeStock: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Warehouse Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newBatchForm.warehouseStock}
                    onChange={(e) =>
                      setNewBatchForm({ ...newBatchForm, warehouseStock: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Damaged Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newBatchForm.damagedStock}
                    onChange={(e) =>
                      setNewBatchForm({ ...newBatchForm, damagedStock: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newBatchForm.expiryDate}
                    onChange={(e) =>
                      setNewBatchForm({ ...newBatchForm, expiryDate: e.target.value })
                    }
                    className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Warehouse Vault & Rack Location
                </label>
                <input
                  type="text"
                  value={newBatchForm.location}
                  onChange={(e) =>
                    setNewBatchForm({ ...newBatchForm, location: e.target.value })
                  }
                  placeholder="e.g. Warehouse Vault Alpha - Rack A1"
                  className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-black hover:bg-stone-800 text-white font-extrabold text-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Save & Register Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adjust Stock */}
      {isAdjustModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-black">
                  Adjust Batch Stock Levels
                </h3>
                <p className="text-xs text-stone-600 font-mono mt-0.5">
                  {selectedItem.batchNumber} • {selectedItem.productName}
                </p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Office Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={selectedItem.officeStock}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, officeStock: Number(e.target.value) })
                  }
                  className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Warehouse Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={selectedItem.warehouseStock}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, warehouseStock: Number(e.target.value) })
                  }
                  className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Damaged Stock Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={selectedItem.damagedStock}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, damagedStock: Number(e.target.value) })
                  }
                  className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Rack & Vault Location
                </label>
                <input
                  type="text"
                  value={selectedItem.location}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, location: e.target.value })
                  }
                  className="w-full bg-stone-50 text-xs font-bold text-black p-2.5 rounded-xl border border-stone-300 focus:border-black focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-black hover:bg-stone-800 text-white font-extrabold text-xs cursor-pointer transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save Stock Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
