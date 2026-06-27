import React, { useState } from "react";
import { 
  ParameterItem, 
  SKUMasterItem, 
  DemandHistoryItem, 
  InventoryDataItem,
  DemandAnalysisItem,
  ForecastEngineItem,
  ReplenishmentEngineItem,
  RiskMonitorItem,
  PlanningViewItem,
  TabType
} from "../types";
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Calendar,
  Layers,
  Search,
  Check,
  ChevronRight
} from "lucide-react";

interface TableViewsProps {
  currentTab: TabType;
  params: ParameterItem[];
  setParams: React.Dispatch<React.SetStateAction<ParameterItem[]>>;
  skuMaster: SKUMasterItem[];
  setSkuMaster: React.Dispatch<React.SetStateAction<SKUMasterItem[]>>;
  demandHistory: DemandHistoryItem[];
  setDemandHistory: React.Dispatch<React.SetStateAction<DemandHistoryItem[]>>;
  inventoryData: InventoryDataItem[];
  setInventoryData: React.Dispatch<React.SetStateAction<InventoryDataItem[]>>;
  
  // Results calculated dynamically
  demandAnalysis: DemandAnalysisItem[];
  forecastEngine: ForecastEngineItem[];
  replenishmentEngine: ReplenishmentEngineItem[];
  riskMonitor: RiskMonitorItem[];
  planningView: PlanningViewItem[];
  setPlanningView: React.Dispatch<React.SetStateAction<PlanningViewItem[]>>;
}

// Inline data bar component (Primary color fill, track is 10% opacity of primary color)
function InlineDataBar({ 
  value, 
  max, 
  isCurrency = false 
}: { 
  value: number; 
  max: number; 
  isCurrency?: boolean 
}) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const displayVal = isCurrency 
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
    : value.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <div className="flex items-center space-x-2 w-32 shrink-0">
      <span className="text-xs font-mono font-medium text-brand-primary/90 w-14 text-right shrink-0">{displayVal}</span>
      <div className="flex-1 h-2 rounded-full bg-brand-primary/10 overflow-hidden shrink-0">
        <div 
          className="h-full bg-brand-accent rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function TableViews({
  currentTab,
  params,
  setParams,
  skuMaster,
  setSkuMaster,
  demandHistory,
  setDemandHistory,
  inventoryData,
  setInventoryData,
  demandAnalysis,
  forecastEngine,
  replenishmentEngine,
  riskMonitor,
  planningView,
  setPlanningView
}: TableViewsProps) {

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Input adding states
  const [newSku, setNewSku] = useState<Partial<SKUMasterItem>>({
    skuCode: "", skuName: "", category: "Electronics Accessories", unit: "Units",
    supplierName: "", leadTimeDays: 14, minOrderQty: 50, orderMultiple: 10, unitCost: 10, targetSL: 0.95
  });

  const [newHistory, setNewHistory] = useState<Partial<DemandHistoryItem>>({
    skuCode: "", periodDate: "2026-06", demandQty: 100
  });

  // Action helpers
  const updateParamValue = (id: string, newVal: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, value: newVal } : p));
  };

  const updateInventoryField = (skuCode: string, field: "onHandQty" | "onOrderQty" | "allocatedQty", val: number) => {
    setInventoryData(prev => prev.map(inv => inv.skuCode === skuCode ? { ...inv, [field]: val } : inv));
  };

  const updateSKUMasterField = (skuCode: string, field: keyof SKUMasterItem, val: any) => {
    setSkuMaster(prev => prev.map(s => s.skuCode === skuCode ? { ...s, [field]: val } : s));
  };

  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.skuCode || !newSku.skuName) return;
    
    // Check duplication
    if (skuMaster.some(s => s.skuCode === newSku.skuCode)) {
      alert(`SKU code ${newSku.skuCode} already exists.`);
      return;
    }

    const item: SKUMasterItem = {
      skuCode: newSku.skuCode,
      skuName: newSku.skuName,
      category: newSku.category || "Electronics Accessories",
      unit: newSku.unit || "Units",
      supplierName: newSku.supplierName || "Default Supplier",
      leadTimeDays: Number(newSku.leadTimeDays) || 10,
      minOrderQty: Number(newSku.minOrderQty) || 50,
      orderMultiple: Number(newSku.orderMultiple) || 10,
      unitCost: Number(newSku.unitCost) || 10,
      targetSL: Number(newSku.targetSL) || 0.95
    };

    setSkuMaster(prev => [...prev, item]);
    // Also create initial blank inventory data for it
    setInventoryData(prev => [...prev, { skuCode: item.skuCode, onHandQty: 0, onOrderQty: 0, allocatedQty: 0 }]);
    
    // Reset inputs
    setNewSku({
      skuCode: "", skuName: "", category: "Electronics Accessories", unit: "Units",
      supplierName: "", leadTimeDays: 14, minOrderQty: 50, orderMultiple: 10, unitCost: 10, targetSL: 0.95
    });
  };

  const handleAddHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHistory.skuCode || !newHistory.periodDate) return;

    const item: DemandHistoryItem = {
      id: `REC-${newHistory.skuCode}-${newHistory.periodDate}`,
      skuCode: newHistory.skuCode,
      periodDate: newHistory.periodDate,
      demandQty: Number(newHistory.demandQty) || 0
    };

    setDemandHistory(prev => [...prev, item]);
    setNewHistory({ skuCode: "", periodDate: "2026-06", demandQty: 100 });
  };

  const handleDeleteHistory = (id: string) => {
    setDemandHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleDeleteSKU = (skuCode: string) => {
    if (confirm(`Are you sure you want to delete SKU ${skuCode}? This will remove all inventory and calculation references.`)) {
      setSkuMaster(prev => prev.filter(s => s.skuCode !== skuCode));
      setInventoryData(prev => prev.filter(i => i.skuCode !== skuCode));
      setDemandHistory(prev => prev.filter(h => h.skuCode !== skuCode));
    }
  };

  const handlePlanningSelect = (skuCode: string) => {
    setPlanningView(prev => prev.map(item => 
      item.skuCode === skuCode ? { ...item, selected: !item.selected } : item
    ));
  };

  const handlePlanningQtyChange = (skuCode: string, qty: number) => {
    setPlanningView(prev => prev.map(item => 
      item.skuCode === skuCode 
        ? { ...item, finalQty: qty, purchaseCost: parseFloat((qty * item.unitCost).toFixed(2)) } 
        : item
    ));
  };

  const handleCheckout = () => {
    const selectedOrders = planningView.filter(item => item.selected);
    if (selectedOrders.length === 0) {
      alert("No active items selected for purchase.");
      return;
    }

    const orderSummary = selectedOrders.map(item => 
      `• ${item.skuName}: Qty ${item.finalQty} ($${item.purchaseCost.toLocaleString()})`
    ).join("\n");

    const grandTotal = selectedOrders.reduce((sum, item) => sum + item.purchaseCost, 0);

    alert(`Successfully Simulated Purchase Order Placement!\n\nSummary:\n${orderSummary}\n\nGrand Total: $${grandTotal.toLocaleString()}\n\nThese order quantities will be simulated as added to "On Order" values inside Inventory Data!`);

    // Add finalQty to On Order Qty in inventoryState
    setInventoryData(prev => prev.map(inv => {
      const match = selectedOrders.find(o => o.skuCode === inv.skuCode);
      if (match) {
        return {
          ...inv,
          onOrderQty: inv.onOrderQty + match.finalQty
        };
      }
      return inv;
    }));
  };

  // Helper values for inline bars limits
  const max12MQty = Math.max(...demandAnalysis.map(a => a.total12MQty), 1);
  const max12MValue = Math.max(...demandAnalysis.map(a => a.total12MValue), 1);
  const maxCV = Math.max(...demandAnalysis.map(a => a.cvValue), 1);
  const maxOnStock = Math.max(...inventoryData.map(i => i.onHandQty), 1);
  const maxDaysOfSupply = Math.max(...riskMonitor.map(r => r.daysOfSupply === 999 ? 0 : r.daysOfSupply), 120);

  // Common styles for Tables container
  const tableContainerClass = "w-full bg-white rounded-xl shadow-sm border border-brand-primary/5 overflow-hidden animate-fade-in";

  // Search input element
  const searchBar = (
    <div className="relative w-64">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
      <input
        type="text"
        placeholder="Filter by SKU or Attribute..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="editable-input pl-9 pr-4 py-1.5 text-xs w-full bg-white"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Search Header for inventory grids */}
      {["SKU_MASTER", "DEMAND_HISTORY", "INVENTORY_DATA", "DEMAND_ANALYSIS", "FORECAST_ENGINE", "REPLENISHMENT_ENGINE", "RISK_MONITOR"].includes(currentTab) && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-brand-primary/5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">Active Worksheet: {currentTab.replace("_", " ")}</span>
          </div>
          {searchBar}
        </div>
      )}

      {/* 1. PARAMETER SETUP SHEET */}
      {currentTab === "PARAM_SETUP" && (
        <div className={tableContainerClass}>
          <div className="p-4 border-b border-brand-primary/10 flex justify-between items-center bg-brand-primary/[0.02]">
            <div>
              <h3 className="eb-garamond-title text-xl font-bold text-brand-primary">Parameter_Setup (Global Controls)</h3>
              <p className="text-xs text-brand-gray">Modify global thresholds and carrying cost factors. Instantly propagates.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04]">
                  <th className="p-3 table-header-custom w-[100px]">ID</th>
                  <th className="p-3 table-header-custom w-[180px]">Category</th>
                  <th className="p-3 table-header-custom">Parameter Name</th>
                  <th className="p-3 table-header-custom text-right w-[150px]">Value</th>
                  <th className="p-3 table-header-custom">Description</th>
                </tr>
              </thead>
              <tbody>
                {params.map(p => (
                  <tr key={p.id} className="border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all">
                    <td className="p-3 font-mono font-bold text-xs text-brand-gray">{p.id}</td>
                    <td className="p-3">
                      <span className="badge-pill bg-brand-primary/5 text-brand-primary">{p.category}</span>
                    </td>
                    <td className="p-3 font-medium text-brand-primary text-xs">{p.name}</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={p.value}
                        onChange={(e) => updateParamValue(p.id, parseFloat(e.target.value) || 0)}
                        className="editable-input text-right font-mono font-semibold text-xs w-[100px]"
                      />
                    </td>
                    <td className="p-3 text-xs text-brand-gray leading-relaxed">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SKU MASTER SHEET */}
      {currentTab === "SKU_MASTER" && (
        <div className="space-y-6">
          {/* Add SKU Mini-Form */}
          <form onSubmit={handleAddSku} className="bg-white p-5 rounded-xl shadow-sm border border-brand-primary/5 grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div className="col-span-2 md:col-span-1 flex flex-col space-y-1">
              <label className="text-[10px] text-brand-gray uppercase font-semibold">SKU Code</label>
              <input 
                type="text" 
                placeholder="e.g. SKU009" 
                required
                value={newSku.skuCode}
                onChange={(e) => setNewSku(prev => ({ ...prev, skuCode: e.target.value.toUpperCase() }))}
                className="editable-input text-xs"
              />
            </div>
            <div className="col-span-2 flex flex-col space-y-1">
              <label className="text-[10px] text-brand-gray uppercase font-semibold">SKU Name</label>
              <input 
                type="text" 
                placeholder="Product description" 
                required
                value={newSku.skuName}
                onChange={(e) => setNewSku(prev => ({ ...prev, skuName: e.target.value }))}
                className="editable-input text-xs"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-brand-gray uppercase font-semibold">Lead Time (Days)</label>
              <input 
                type="number" 
                min="1"
                value={newSku.leadTimeDays}
                onChange={(e) => setNewSku(prev => ({ ...prev, leadTimeDays: Number(e.target.value) }))}
                className="editable-input text-xs font-mono"
              />
            </div>
            <button 
              type="submit" 
              className="bg-brand-primary hover:bg-brand-primary/95 text-white font-medium py-2 px-4 rounded-lg text-xs flex items-center justify-center space-x-1 transition-all h-[32px] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-brand-accent" />
              <span>Add SKU</span>
            </button>
          </form>

          {/* SKU Table */}
          <div className={tableContainerClass}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04]">
                    <th className="p-3 table-header-custom">SKU Code</th>
                    <th className="p-3 table-header-custom">Product Description</th>
                    <th className="p-3 table-header-custom">Category</th>
                    <th className="p-3 table-header-custom text-right">Lead Time</th>
                    <th className="p-3 table-header-custom text-right">Min Order (MOQ)</th>
                    <th className="p-3 table-header-custom text-right">Multiple</th>
                    <th className="p-3 table-header-custom text-right">Unit Cost</th>
                    <th className="p-3 table-header-custom text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {skuMaster
                    .filter(s => s.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) || s.skuName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(s => (
                      <tr key={s.skuCode} className="border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all">
                        <td className="p-3 font-mono font-bold text-xs text-brand-primary">{s.skuCode}</td>
                        <td className="p-3 text-xs text-brand-primary font-medium">{s.skuName}</td>
                        <td className="p-3 text-xs text-brand-gray">{s.category}</td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={s.leadTimeDays}
                            onChange={(e) => updateSKUMasterField(s.skuCode, "leadTimeDays", Number(e.target.value))}
                            className="editable-input text-right font-mono text-xs w-[60px]"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={s.minOrderQty}
                            onChange={(e) => updateSKUMasterField(s.skuCode, "minOrderQty", Number(e.target.value))}
                            className="editable-input text-right font-mono text-xs w-[80px]"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={s.orderMultiple}
                            onChange={(e) => updateSKUMasterField(s.skuCode, "orderMultiple", Number(e.target.value))}
                            className="editable-input text-right font-mono text-xs w-[70px]"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            step="0.1"
                            value={s.unitCost}
                            onChange={(e) => updateSKUMasterField(s.skuCode, "unitCost", Number(e.target.value))}
                            className="editable-input text-right font-mono text-xs w-[80px]"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteSKU(s.skuCode)}
                            className="p-1 rounded hover:bg-brand-red/10 text-brand-red transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* 3. DEMAND HISTORY SHEET */}
      {currentTab === "DEMAND_HISTORY" && (
        <div className="space-y-6">
          {/* Add History Form */}
          <form onSubmit={handleAddHistory} className="bg-white p-5 rounded-xl shadow-sm border border-brand-primary/5 grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-brand-gray uppercase font-semibold">SKU Select</label>
              <select
                value={newHistory.skuCode}
                onChange={(e) => setNewHistory(prev => ({ ...prev, skuCode: e.target.value }))}
                className="editable-input text-xs"
                required
              >
                <option value="">-- Choose SKU --</option>
                {skuMaster.map(s => <option key={s.skuCode} value={s.skuCode}>{s.skuCode} ({s.skuName})</option>)}
              </select>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-brand-gray uppercase font-semibold">Period Date (YYYY-MM)</label>
              <input
                type="month"
                required
                value={newHistory.periodDate}
                onChange={(e) => setNewHistory(prev => ({ ...prev, periodDate: e.target.value }))}
                className="editable-input text-xs font-mono"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-brand-gray uppercase font-semibold">Demand Qty</label>
              <input
                type="number"
                min="0"
                value={newHistory.demandQty}
                onChange={(e) => setNewHistory(prev => ({ ...prev, demandQty: Number(e.target.value) }))}
                className="editable-input text-xs font-mono"
              />
            </div>
            <button 
              type="submit" 
              className="bg-brand-primary hover:bg-brand-primary/95 text-white font-medium py-2 px-4 rounded-lg text-xs flex items-center justify-center space-x-1 transition-all h-[32px] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-brand-accent" />
              <span>Add Record</span>
            </button>
          </form>

          {/* History Grid */}
          <div className={tableContainerClass}>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04] sticky top-0 z-10">
                    <th className="p-3 table-header-custom">Record ID</th>
                    <th className="p-3 table-header-custom">SKU Code</th>
                    <th className="p-3 table-header-custom">Period Month</th>
                    <th className="p-3 table-header-custom text-right">Demand Qty</th>
                    <th className="p-3 table-header-custom text-right">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {demandHistory
                    .filter(h => h.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) || h.periodDate.includes(searchTerm))
                    .map(h => (
                      <tr key={h.id} className="border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all">
                        <td className="p-3 font-mono text-[11px] text-brand-gray">{h.id}</td>
                        <td className="p-3 font-mono font-bold text-xs text-brand-primary">{h.skuCode}</td>
                        <td className="p-3 text-xs font-semibold text-brand-primary">{h.periodDate}</td>
                        <td className="p-3 text-right font-mono text-xs text-brand-primary font-bold">{h.demandQty}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteHistory(h.id)}
                            className="p-1 rounded hover:bg-brand-red/10 text-brand-red transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* 4. CURRENT INVENTORY WORKBOOK SHEET */}
      {currentTab === "INVENTORY_DATA" && (
        <div className={tableContainerClass}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04]">
                  <th className="p-3 table-header-custom">SKU Code</th>
                  <th className="p-3 table-header-custom">On Hand (In Stock)</th>
                  <th className="p-3 table-header-custom">On Order (In Transit)</th>
                  <th className="p-3 table-header-custom">Allocated (Reserved)</th>
                  <th className="p-3 table-header-custom text-right">Available (Formula)</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData
                  .filter(inv => inv.skuCode.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(inv => {
                    const available = inv.onHandQty + inv.onOrderQty - inv.allocatedQty;
                    return (
                      <tr key={inv.skuCode} className="border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all">
                        <td className="p-3 font-mono font-bold text-xs text-brand-primary">{inv.skuCode}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={inv.onHandQty}
                            onChange={(e) => updateInventoryField(inv.skuCode, "onHandQty", Number(e.target.value))}
                            className="editable-input font-mono text-xs w-[120px]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={inv.onOrderQty}
                            onChange={(e) => updateInventoryField(inv.skuCode, "onOrderQty", Number(e.target.value))}
                            className="editable-input font-mono text-xs w-[120px]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={inv.allocatedQty}
                            onChange={(e) => updateInventoryField(inv.skuCode, "allocatedQty", Number(e.target.value))}
                            className="editable-input font-mono text-xs w-[120px]"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="font-mono font-bold text-xs text-brand-accent">{available}</span>
                            <span className="text-[10px] text-brand-gray font-mono uppercase">units</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DEMAND ANALYSIS WORKBOOK SHEET (READ-ONLY FORMULAS) */}
      {currentTab === "DEMAND_ANALYSIS" && (
        <div className={tableContainerClass}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04]">
                  <th className="p-3 table-header-custom">SKU Code</th>
                  <th className="p-3 table-header-custom text-right">Total 12M Vol</th>
                  <th className="p-3 table-header-custom">12M Revenue (Value) Bar</th>
                  <th className="p-3 table-header-custom text-right">Monthly Mean</th>
                  <th className="p-3 table-header-custom text-right">Monthly SD</th>
                  <th className="p-3 table-header-custom">CV (Volatility) Bar</th>
                  <th className="p-3 table-header-custom text-center">ABC Class</th>
                  <th className="p-3 table-header-custom text-center">XYZ Class</th>
                  <th className="p-3 table-header-custom text-center">Joint Matrix</th>
                </tr>
              </thead>
              <tbody>
                {demandAnalysis
                  .filter(a => a.skuCode.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(a => (
                    <tr key={a.skuCode} className="border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all text-xs">
                      <td className="p-3 font-mono font-bold text-brand-primary">{a.skuCode}</td>
                      <td className="p-3 text-right font-mono text-brand-primary/80">{a.total12MQty.toLocaleString()}</td>
                      <td className="p-3">
                        <InlineDataBar value={a.total12MValue} max={max12MValue} isCurrency={true} />
                      </td>
                      <td className="p-3 text-right font-mono">{a.avgMonthlyDem}</td>
                      <td className="p-3 text-right font-mono text-brand-gray">{a.stDevMonthly}</td>
                      <td className="p-3">
                        <InlineDataBar value={a.cvValue} max={maxCV} />
                      </td>
                      <td className="p-3 text-center">
                        <span className={`badge-pill ${
                          a.abcClass === "A" ? "bg-brand-red/10 text-brand-red font-semibold" : a.abcClass === "B" ? "bg-brand-accent/10 text-brand-accent" : "bg-brand-primary/5 text-brand-primary"
                        }`}>
                          {a.abcClass}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`badge-pill ${
                          a.xyzClass === "X" ? "bg-brand-green/15 text-brand-green font-semibold" : a.xyzClass === "Y" ? "bg-brand-accent/10 text-brand-accent" : "bg-brand-red/10 text-brand-red"
                        }`}>
                          {a.xyzClass}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="badge-pill bg-brand-primary text-white font-mono font-bold tracking-wider">{a.jointClass}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. FORECAST ENGINE WORKBOOK SHEET (READ-ONLY FORMULAS) */}
      {currentTab === "FORECAST_ENGINE" && (
        <div className={tableContainerClass}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04]">
                  <th className="p-3 table-header-custom">SKU Code</th>
                  <th className="p-3 table-header-custom text-right">M-3 (Apr)</th>
                  <th className="p-3 table-header-custom text-right">M-2 (May)</th>
                  <th className="p-3 table-header-custom text-right">M-1 (Jun)</th>
                  <th className="p-3 table-header-custom text-right">Trend L3M</th>
                  <th className="p-3 table-header-custom">Best-Fit Model</th>
                  <th className="p-3 table-header-custom text-right bg-brand-accent/5 font-semibold text-brand-accent">Forecast M1</th>
                  <th className="p-3 table-header-custom text-right">Forecast M2</th>
                  <th className="p-3 table-header-custom text-right">Forecast M3</th>
                </tr>
              </thead>
              <tbody>
                {forecastEngine
                  .filter(f => f.skuCode.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(f => (
                    <tr key={f.skuCode} className="border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all text-xs">
                      <td className="p-3 font-mono font-bold text-brand-primary">{f.skuCode}</td>
                      <td className="p-3 text-right font-mono text-brand-gray">{f.mMinus3}</td>
                      <td className="p-3 text-right font-mono text-brand-gray">{f.mMinus2}</td>
                      <td className="p-3 text-right font-mono font-semibold text-brand-primary">{f.mMinus1}</td>
                      <td className={`p-3 text-right font-mono font-semibold ${f.trendL3M >= 0 ? "text-brand-green" : "text-brand-red"}`}>
                        {f.trendL3M >= 0 ? `+${f.trendL3M}%` : `${f.trendL3M}%`}
                      </td>
                      <td className="p-3">
                        <span className="badge-pill bg-brand-primary/5 text-brand-primary/90 font-medium">{f.forecastMethod}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-brand-accent bg-brand-accent/[0.02]">{f.forecastM1}</td>
                      <td className="p-3 text-right font-mono">{f.forecastM2}</td>
                      <td className="p-3 text-right font-mono">{f.forecastM3}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. REPLENISHMENT ENGINE WORKBOOK SHEET (READ-ONLY FORMULAS) */}
      {currentTab === "REPLENISHMENT_ENGINE" && (
        <div className={tableContainerClass}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04]">
                  <th className="p-3 table-header-custom">SKU Code</th>
                  <th className="p-3 table-header-custom text-right">Daily Demand</th>
                  <th className="p-3 table-header-custom text-right">Daily SD</th>
                  <th className="p-3 table-header-custom text-right">Service Level</th>
                  <th className="p-3 table-header-custom text-right">Z Score</th>
                  <th className="p-3 table-header-custom text-right font-semibold text-brand-primary">Safety Stock (SS)</th>
                  <th className="p-3 table-header-custom text-right bg-brand-primary/5 font-semibold text-brand-primary">Reorder Point (ROP)</th>
                  <th className="p-3 table-header-custom text-right">Available</th>
                  <th className="p-3 table-header-custom text-center">Trigger Order</th>
                  <th className="p-3 table-header-custom text-right font-semibold text-brand-accent">Suggested Qty (SOQ)</th>
                </tr>
              </thead>
              <tbody>
                {replenishmentEngine
                  .filter(r => r.skuCode.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(r => (
                    <tr key={r.skuCode} className="border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all text-xs">
                      <td className="p-3 font-mono font-bold text-brand-primary">{r.skuCode}</td>
                      <td className="p-3 text-right font-mono">{r.dailyDemandAvg}</td>
                      <td className="p-3 text-right font-mono text-brand-gray">{r.dailyStDev}</td>
                      <td className="p-3 text-right font-mono font-semibold text-brand-primary">{r.targetSL}%</td>
                      <td className="p-3 text-right font-mono text-brand-gray">{r.serviceLevelZ}</td>
                      <td className="p-3 text-right font-mono font-semibold text-brand-primary">{r.safetyStock}</td>
                      <td className="p-3 text-right font-mono font-bold text-brand-primary bg-brand-primary/[0.02]">{r.reorderPoint}</td>
                      <td className="p-3 text-right font-mono font-semibold">{r.availableQty}</td>
                      <td className="p-3 text-center">
                        <span className={`badge-pill font-bold uppercase ${
                          r.triggerOrder === "Y" ? "bg-brand-red/10 text-brand-red animate-pulse" : "bg-brand-green/10 text-brand-green"
                        }`}>
                          {r.triggerOrder === "Y" ? "Order (Y)" : "Hold (N)"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-brand-accent">{r.suggestOrderQty}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. RISK MONITOR WORKBOOK SHEET (READ-ONLY FORMULAS) */}
      {currentTab === "RISK_MONITOR" && (
        <div className={tableContainerClass}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04]">
                  <th className="p-3 table-header-custom">SKU Code</th>
                  <th className="p-3 table-header-custom">OnHand (Qty)</th>
                  <th className="p-3 table-header-custom text-right">Daily Demand</th>
                  <th className="p-3 table-header-custom">Days of Supply (MOS) Bar</th>
                  <th className="p-3 table-header-custom text-right">Lead Time (Days)</th>
                  <th className="p-3 table-header-custom text-center">Risk Status</th>
                  <th className="p-3 table-header-custom text-right">Overstock Qty</th>
                  <th className="p-3 table-header-custom text-right font-semibold text-brand-red">Overstock Value Risk</th>
                </tr>
              </thead>
              <tbody>
                {riskMonitor
                  .filter(r => r.skuCode.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(r => (
                    <tr key={r.skuCode} className="border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all text-xs">
                      <td className="p-3 font-mono font-bold text-brand-primary">{r.skuCode}</td>
                      <td className="p-3 font-mono text-brand-primary/80">{r.onHandQty}</td>
                      <td className="p-3 text-right font-mono text-brand-gray">{r.dailyDemand}</td>
                      <td className="p-3">
                        <InlineDataBar value={r.daysOfSupply} max={maxDaysOfSupply} />
                      </td>
                      <td className="p-3 text-right font-mono">{r.leadTime}</td>
                      <td className="p-3 text-center">
                        <span className={`badge-pill font-semibold ${
                          r.riskStatus === "1. Out of Stock" 
                            ? "bg-brand-red/15 text-brand-red font-bold" 
                            : r.riskStatus === "2. High Stockout Risk" 
                            ? "bg-brand-accent/10 text-brand-accent font-semibold" 
                            : r.riskStatus === "4. Serious Excess" 
                            ? "bg-brand-primary/10 text-brand-primary font-semibold"
                            : "bg-brand-green/10 text-brand-green font-medium"
                        }`}>
                          {r.riskStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-brand-gray">{r.overstockQty}</td>
                      <td className="p-3 text-right font-mono font-bold text-brand-red">${r.capitalRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. REPLENISHMENT EXECUTION CHECKLIST (PLANNING VIEW) */}
      {currentTab === "PLANNING_VIEW" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="eb-garamond-title text-xl font-bold text-brand-primary">Purchase Orders Builder</h3>
              <p className="text-xs text-brand-gray">
                Verify suggested order quantities, adjust final volumes, and click Place Order to submit to inventory tracking.
              </p>
            </div>
            
            <button
              id="btn-place-order"
              onClick={handleCheckout}
              disabled={planningView.length === 0}
              className={`bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1 cursor-pointer ${
                planningView.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Simulate Checkout Order</span>
            </button>
          </div>

          <div className={tableContainerClass}>
            {planningView.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-primary/10 bg-brand-primary/[0.04]">
                      <th className="p-3 table-header-custom text-center w-[60px]">Select</th>
                      <th className="p-3 table-header-custom">SKU Code</th>
                      <th className="p-3 table-header-custom">Product Description</th>
                      <th className="p-3 table-header-custom">Preferred Supplier</th>
                      <th className="p-3 table-header-custom text-right">Suggested Qty (SOQ)</th>
                      <th className="p-3 table-header-custom text-right w-[140px]">Final Qty</th>
                      <th className="p-3 table-header-custom text-right">Unit Cost</th>
                      <th className="p-3 table-header-custom text-right">Purchase Cost</th>
                      <th className="p-3 table-header-custom text-right">Est. Arrival Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planningView.map(p => (
                      <tr key={p.skuCode} className={`border-b border-brand-primary/5 hover:bg-brand-primary/[0.01] transition-all text-xs ${
                        p.selected ? "bg-brand-accent/[0.01]" : "opacity-60"
                      }`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.selected}
                            onChange={() => handlePlanningSelect(p.skuCode)}
                            className="w-4 h-4 rounded border-brand-primary/20 text-brand-accent focus:ring-brand-accent cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-mono font-bold text-brand-primary">{p.skuCode}</td>
                        <td className="p-3 font-medium text-brand-primary">{p.skuName}</td>
                        <td className="p-3 text-brand-gray">{p.supplierName}</td>
                        <td className="p-3 text-right font-mono">{p.suggestQty}</td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            value={p.finalQty}
                            onChange={(e) => handlePlanningQtyChange(p.skuCode, Number(e.target.value) || 0)}
                            className="editable-input text-right font-mono text-xs w-[100px]"
                          />
                        </td>
                        <td className="p-3 text-right font-mono">${p.unitCost.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-bold text-brand-accent">${p.purchaseCost.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1 text-brand-gray font-mono">
                            <span>{p.leadTime}</span>
                            <span className="text-[9px] uppercase">days</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-brand-gray space-y-2">
                <CheckCircle className="w-12 h-12 text-brand-green mx-auto mb-2" />
                <h4 className="font-semibold text-brand-primary">No Replenishment Triggered</h4>
                <p className="text-xs max-w-sm mx-auto">
                  All SKU Available inventory levels reside safely above their computed statistical Reorder Points. No orders required.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
