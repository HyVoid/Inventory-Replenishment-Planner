import { 
  ParameterItem, 
  SKUMasterItem, 
  DemandHistoryItem, 
  InventoryDataItem,
  DemandAnalysisItem,
  ForecastEngineItem,
  ReplenishmentEngineItem,
  RiskMonitorItem,
  PlanningViewItem
} from "../types";

// Rational approximation for the inverse standard normal cumulative distribution (NORMSINV)
// Highly accurate Beasley-Springer-Moro approximation
export function normsinv(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  
  const t = p < 0.5 ? Math.sqrt(-2.0 * Math.log(p)) : Math.sqrt(-2.0 * Math.log(1.0 - p));
  const num = c0 + (c1 * t) + (c2 * t * t);
  const den = 1.0 + (d1 * t) + (d2 * t * t) + (d3 * t * t * t);
  const val = t - (num / den);
  
  return p < 0.5 ? -val : val;
}

// Calculate standard deviation of population
export function calculateStDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// Run the full inventory workbook logic
export interface WorkbookResults {
  demandAnalysis: DemandAnalysisItem[];
  forecastEngine: ForecastEngineItem[];
  replenishmentEngine: ReplenishmentEngineItem[];
  riskMonitor: RiskMonitorItem[];
  planningView: PlanningViewItem[];
}

export function runReplenishmentCalculations(
  params: ParameterItem[],
  skuMaster: SKUMasterItem[],
  demandHistory: DemandHistoryItem[],
  inventoryData: InventoryDataItem[]
): WorkbookResults {
  // 1. Get parameters and configuration limits
  const aClassLimit = params.find(p => p.id === "P004")?.value ?? 0.70;
  const bClassLimit = params.find(p => p.id === "P005")?.value ?? 0.90;
  const xLimit = params.find(p => p.id === "P006")?.value ?? 0.20;
  const yLimit = params.find(p => p.id === "P007")?.value ?? 0.50;
  const overstockThreshold = params.find(p => p.id === "P009")?.value ?? 90;

  // Track the 12-month demand history for each SKU
  // The demo dataset spans 2025-07 to 2026-06 (12 months)
  const sku12MonthValues = skuMaster.map(sku => {
    const history = demandHistory.filter(h => h.skuCode === sku.skuCode);
    const qtys = history.map(h => h.demandQty);
    const totalQty = qtys.reduce((sum, q) => sum + q, 0);
    const totalValue = totalQty * sku.unitCost;
    const avgMonthly = totalQty / 12;
    const stDev = calculateStDev(qtys);
    const cv = avgMonthly > 0 ? stDev / avgMonthly : 9.99;

    return {
      skuCode: sku.skuCode,
      skuName: sku.skuName,
      category: sku.category,
      unitCost: sku.unitCost,
      totalQty,
      totalValue,
      avgMonthly,
      stDev,
      cv
    };
  });

  // Calculate Cumulative percentages for ABC classification
  // First, sort descending by total 12M value
  const sortedByValue = [...sku12MonthValues].sort((a, b) => b.totalValue - a.totalValue);
  const totalAllValue = sortedByValue.reduce((sum, item) => sum + item.totalValue, 0);

  let cumulativeValue = 0;
  const abcMap = new Map<string, { abcClass: "A" | "B" | "C"; cumulativePct: number }>();

  sortedByValue.forEach(item => {
    cumulativeValue += item.totalValue;
    const pct = totalAllValue > 0 ? cumulativeValue / totalAllValue : 0;
    
    let abcClass: "A" | "B" | "C" = "C";
    if (pct <= aClassLimit) {
      abcClass = "A";
    } else if (pct <= bClassLimit) {
      abcClass = "B";
    } else {
      abcClass = "C";
    }

    abcMap.set(item.skuCode, { abcClass, cumulativePct: pct });
  });

  // 2. Build DEMAND_ANALYSIS
  const demandAnalysis: DemandAnalysisItem[] = skuMaster.map(sku => {
    const stats = sku12MonthValues.find(s => s.skuCode === sku.skuCode)!;
    const abcInfo = abcMap.get(sku.skuCode)!;
    
    let xyzClass: "X" | "Y" | "Z" = "Z";
    if (stats.cv <= xLimit) {
      xyzClass = "X";
    } else if (stats.cv <= yLimit) {
      xyzClass = "Y";
    }

    return {
      skuCode: sku.skuCode,
      skuName: sku.skuName,
      category: sku.category,
      unitCost: sku.unitCost,
      total12MQty: stats.totalQty,
      total12MValue: stats.totalValue,
      avgMonthlyDem: parseFloat(stats.avgMonthly.toFixed(2)),
      stDevMonthly: parseFloat(stats.stDev.toFixed(2)),
      cvValue: parseFloat(stats.cv.toFixed(2)),
      abcClass: abcInfo.abcClass,
      xyzClass,
      jointClass: `${abcInfo.abcClass}${xyzClass}`
    };
  });

  // 3. Build FORECAST_ENGINE
  const forecastEngine: ForecastEngineItem[] = skuMaster.map(sku => {
    const analysis = demandAnalysis.find(a => a.skuCode === sku.skuCode)!;
    
    // Sort history by month to get last 3 months (M-3, M-2, M-1)
    // Demands: July 2025 to June 2026. June 2026 is M-1, May 2026 is M-2, April 2026 is M-3
    const skuHistory = demandHistory.filter(h => h.skuCode === sku.skuCode);
    const sortedHistory = [...skuHistory].sort((a, b) => a.periodDate.localeCompare(b.periodDate));
    
    const mMinus1Item = sortedHistory[sortedHistory.length - 1]; // June 2026
    const mMinus2Item = sortedHistory[sortedHistory.length - 2]; // May 2026
    const mMinus3Item = sortedHistory[sortedHistory.length - 3]; // April 2026

    const mMinus1 = mMinus1Item ? mMinus1Item.demandQty : 0;
    const mMinus2 = mMinus2Item ? mMinus2Item.demandQty : 0;
    const mMinus3 = mMinus3Item ? mMinus3Item.demandQty : 0;

    const trendL3M = mMinus3 > 0 ? (mMinus1 - mMinus3) / mMinus3 : 0;

    let forecastMethod = "3-Month Moving Average";
    let forecastM1 = 0;

    if (analysis.cvValue <= xLimit) {
      forecastMethod = "3-Month Moving Average";
      forecastM1 = (mMinus1 + mMinus2 + mMinus3) / 3;
    } else if (analysis.cvValue <= yLimit) {
      forecastMethod = "Weighted MA (5:3:2)";
      forecastM1 = (mMinus1 * 0.5) + (mMinus2 * 0.3) + (mMinus3 * 0.2);
    } else {
      forecastMethod = "Median Smoothing";
      const sortedValues = [mMinus1, mMinus2, mMinus3].sort((a, b) => a - b);
      forecastM1 = sortedValues[1]; // Middle element (median)
    }

    // Roll calculations for M2 and M3
    // Use trend for modest rolling adjustments with caps to preserve bounds
    const trendFactor = Math.max(-0.2, Math.min(0.2, trendL3M)); // Cap trend contribution to [-20%, +20%]
    const forecastM2 = forecastM1 * (1 + trendFactor * 0.5);
    const forecastM3 = forecastM2 * (1 + trendFactor * 0.5);

    return {
      skuCode: sku.skuCode,
      skuName: sku.skuName,
      mMinus1,
      mMinus2,
      mMinus3,
      trendL3M: parseFloat((trendL3M * 100).toFixed(1)),
      forecastMethod,
      forecastM1: parseFloat(forecastM1.toFixed(2)),
      forecastM2: parseFloat(forecastM2.toFixed(2)),
      forecastM3: parseFloat(forecastM3.toFixed(2))
    };
  });

  // 4. Build REPLENISHMENT_ENGINE
  const replenishmentEngine: ReplenishmentEngineItem[] = skuMaster.map(sku => {
    const analysis = demandAnalysis.find(a => a.skuCode === sku.skuCode)!;
    const forecast = forecastEngine.find(f => f.skuCode === sku.skuCode)!;
    const inv = inventoryData.find(i => i.skuCode === sku.skuCode) || { onHandQty: 0, onOrderQty: 0, allocatedQty: 0 };

    const dailyDemandAvg = forecast.forecastM1 / 30;
    const dailyStDev = analysis.stDevMonthly / Math.sqrt(30);

    // Map Parameter setup defaults for target service levels
    const paramId = analysis.abcClass === "A" ? "P001" : analysis.abcClass === "B" ? "P002" : "P003";
    const targetSL = params.find(p => p.id === paramId)?.value ?? sku.targetSL;
    
    const serviceLevelZ = normsinv(targetSL);

    // Safety Stock = ROUNDUP(Service_Level_Z * Daily_StDev * SQRT(Lead_Time), 0)
    const safetyStock = Math.ceil(Math.max(0, serviceLevelZ * dailyStDev * Math.sqrt(sku.leadTimeDays)));
    
    // Reorder Point = ROUNDUP((Daily_Demand_Avg * Lead_Time) + Safety_Stock, 0)
    const reorderPoint = Math.ceil((dailyDemandAvg * sku.leadTimeDays) + safetyStock);

    // Available_Qty = On_Hand_Qty + On_Order_Qty - Allocated_Qty
    const availableQty = inv.onHandQty + inv.onOrderQty - inv.allocatedQty;

    const triggerOrder = availableQty <= reorderPoint ? "Y" : "N";

    // Target Stock Limit (Target Stock coverage = Lead Time + 30 days)
    const targetStock = Math.ceil((dailyDemandAvg * (sku.leadTimeDays + 30)) + safetyStock);

    const netOrderQty = triggerOrder === "Y" ? Math.max(0, targetStock - availableQty) : 0;

    // Suggested Order Quantity incorporating MOQ and Multiple
    let suggestOrderQty = 0;
    if (netOrderQty > 0) {
      if (netOrderQty <= sku.minOrderQty) {
        suggestOrderQty = sku.minOrderQty;
      } else {
        const excess = netOrderQty - sku.minOrderQty;
        const multiplier = sku.orderMultiple > 0 ? sku.orderMultiple : 1;
        suggestOrderQty = sku.minOrderQty + Math.ceil(excess / multiplier) * multiplier;
      }
    }

    return {
      skuCode: sku.skuCode,
      skuName: sku.skuName,
      dailyDemandAvg: parseFloat(dailyDemandAvg.toFixed(2)),
      dailyStDev: parseFloat(dailyStDev.toFixed(2)),
      leadTime: sku.leadTimeDays,
      targetSL: parseFloat((targetSL * 100).toFixed(1)),
      serviceLevelZ: parseFloat(serviceLevelZ.toFixed(3)),
      safetyStock,
      reorderPoint,
      availableQty,
      triggerOrder,
      targetStock,
      netOrderQty,
      suggestOrderQty,
      unitCost: sku.unitCost,
      supplierName: sku.supplierName
    };
  });

  // 5. Build RISK_MONITOR
  const riskMonitor: RiskMonitorItem[] = skuMaster.map(sku => {
    const replenishment = replenishmentEngine.find(r => r.skuCode === sku.skuCode)!;
    const inv = inventoryData.find(i => i.skuCode === sku.skuCode) || { onHandQty: 0, onOrderQty: 0, allocatedQty: 0 };

    const dailyDemand = replenishment.dailyDemandAvg;
    const daysOfSupply = dailyDemand > 0 ? Math.round(inv.onHandQty / dailyDemand) : 999;

    let riskStatus: "1. Out of Stock" | "2. High Stockout Risk" | "3. Healthy" | "4. Serious Excess" = "3. Healthy";
    if (inv.onHandQty === 0) {
      riskStatus = "1. Out of Stock";
    } else if (daysOfSupply < sku.leadTimeDays) {
      riskStatus = "2. High Stockout Risk";
    } else if (daysOfSupply > overstockThreshold) {
      riskStatus = "4. Serious Excess";
    }

    // Overstock Qty
    const overstockQty = daysOfSupply > overstockThreshold 
      ? Math.max(0, inv.onHandQty - Math.ceil(dailyDemand * overstockThreshold)) 
      : 0;

    const capitalRisk = overstockQty * sku.unitCost;

    return {
      skuCode: sku.skuCode,
      skuName: sku.skuName,
      onHandQty: inv.onHandQty,
      dailyDemand: parseFloat(dailyDemand.toFixed(2)),
      daysOfSupply,
      leadTime: sku.leadTimeDays,
      riskStatus,
      overstockQty,
      capitalRisk: parseFloat(capitalRisk.toFixed(2)),
      unitCost: sku.unitCost
    };
  });

  // 6. Build PLANNING_VIEW
  // Automatically pull items triggered for ordering
  const planningView: PlanningViewItem[] = replenishmentEngine
    .filter(r => r.triggerOrder === "Y" && r.suggestOrderQty > 0)
    .map(r => {
      return {
        selected: true, // Default to checked
        skuCode: r.skuCode,
        skuName: r.skuName,
        supplierName: r.supplierName,
        suggestQty: r.suggestOrderQty,
        finalQty: r.suggestOrderQty, // Allowed to adjust
        unitCost: r.unitCost,
        purchaseCost: parseFloat((r.suggestOrderQty * r.unitCost).toFixed(2)),
        leadTime: r.leadTime
      };
    });

  return {
    demandAnalysis,
    forecastEngine,
    replenishmentEngine,
    riskMonitor,
    planningView
  };
}
