export interface ParameterItem {
  id: string;
  category: string;
  name: string;
  value: number;
  desc: string;
}

export interface SKUMasterItem {
  skuCode: string;
  skuName: string;
  category: string;
  unit: string;
  supplierName: string;
  leadTimeDays: number;
  minOrderQty: number;
  orderMultiple: number;
  unitCost: number;
  targetSL: number; // e.g., 0.95 for 95%
}

export interface DemandHistoryItem {
  id: string;
  skuCode: string;
  periodDate: string; // "YYYY-MM"
  demandQty: number;
}

export interface InventoryDataItem {
  skuCode: string;
  onHandQty: number;
  onOrderQty: number;
  allocatedQty: number;
}

// Derived/Calculated interfaces
export interface DemandAnalysisItem {
  skuCode: string;
  skuName: string;
  category: string;
  unitCost: number;
  total12MQty: number;
  total12MValue: number;
  avgMonthlyDem: number;
  stDevMonthly: number;
  cvValue: number;
  abcClass: "A" | "B" | "C";
  xyzClass: "X" | "Y" | "Z";
  jointClass: string; // e.g. "AX", "CY", etc.
}

export interface ForecastEngineItem {
  skuCode: string;
  skuName: string;
  mMinus1: number;
  mMinus2: number;
  mMinus3: number;
  trendL3M: number; // trend percentage
  forecastMethod: string;
  forecastM1: number;
  forecastM2: number;
  forecastM3: number;
}

export interface ReplenishmentEngineItem {
  skuCode: string;
  skuName: string;
  dailyDemandAvg: number;
  dailyStDev: number;
  leadTime: number;
  targetSL: number;
  serviceLevelZ: number;
  safetyStock: number;
  reorderPoint: number;
  availableQty: number;
  triggerOrder: "Y" | "N";
  targetStock: number;
  netOrderQty: number;
  suggestOrderQty: number;
  unitCost: number;
  supplierName: string;
}

export interface RiskMonitorItem {
  skuCode: string;
  skuName: string;
  onHandQty: number;
  dailyDemand: number;
  daysOfSupply: number;
  leadTime: number;
  riskStatus: "1. Out of Stock" | "2. High Stockout Risk" | "3. Healthy" | "4. Serious Excess";
  overstockQty: number;
  capitalRisk: number;
  unitCost: number;
}

export interface PlanningViewItem {
  selected: boolean;
  skuCode: string;
  skuName: string;
  supplierName: string;
  suggestQty: number;
  finalQty: number;
  unitCost: number;
  purchaseCost: number;
  leadTime: number;
}

export type TabType = 
  | "README"
  | "DASHBOARD"
  | "PARAM_SETUP"
  | "SKU_MASTER"
  | "DEMAND_HISTORY"
  | "INVENTORY_DATA"
  | "DEMAND_ANALYSIS"
  | "FORECAST_ENGINE"
  | "REPLENISHMENT_ENGINE"
  | "RISK_MONITOR"
  | "PLANNING_VIEW";
