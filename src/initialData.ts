import { ParameterItem, SKUMasterItem, DemandHistoryItem, InventoryDataItem } from "./types";

export const initialParameters: ParameterItem[] = [
  {
    id: "P001",
    category: "Service Levels",
    name: "A-Class Target Service Level",
    value: 0.98,
    desc: "Target fulfillment rate for high-value A-class items. Corresponds to Z ≈ 2.05."
  },
  {
    id: "P002",
    category: "Service Levels",
    name: "B-Class Target Service Level",
    value: 0.95,
    desc: "Target fulfillment rate for medium-value B-class items. Corresponds to Z ≈ 1.64."
  },
  {
    id: "P003",
    category: "Service Levels",
    name: "C-Class Target Service Level",
    value: 0.90,
    desc: "Target fulfillment rate for low-value C-class items. Corresponds to Z ≈ 1.28."
  },
  {
    id: "P004",
    category: "ABC Thresholds",
    name: "A-Class Cumulative Share",
    value: 0.70,
    desc: "Cumulative annual sales value percentage threshold to qualify as Class A."
  },
  {
    id: "P005",
    category: "ABC Thresholds",
    name: "B-Class Cumulative Share",
    value: 0.90,
    desc: "Cumulative annual sales value percentage threshold to qualify as Class B."
  },
  {
    id: "P006",
    category: "XYZ Thresholds",
    name: "X-Class CV Limit (Stable)",
    value: 0.20,
    desc: "Maximum Coefficient of Variation (CV) for stable, highly predictable demand."
  },
  {
    id: "P007",
    category: "XYZ Thresholds",
    name: "Y-Class CV Limit (Volatile)",
    value: 0.50,
    desc: "Maximum Coefficient of Variation (CV) for moderately volatile demand."
  },
  {
    id: "P008",
    category: "Financial Metrics",
    name: "Annual Inventory Carrying Cost Rate",
    value: 0.25,
    desc: "Cost to hold inventory as a percentage of standard product cost (e.g. 25% annually)."
  },
  {
    id: "P009",
    category: "Risk Control",
    name: "Overstock Threshold Days",
    value: 90,
    desc: "Days of supply beyond which inventory is categorized as serious overstock."
  }
];

export const initialSKUMaster: SKUMasterItem[] = [
  {
    skuCode: "SKU001",
    skuName: "Premium Arabica Coffee Beans (1kg)",
    category: "Food & Beverage",
    unit: "Bags",
    supplierName: "Global Growers S.A.",
    leadTimeDays: 10,
    minOrderQty: 100,
    orderMultiple: 20,
    unitCost: 15.00,
    targetSL: 0.98
  },
  {
    skuCode: "SKU002",
    skuName: "Qi Fast Wireless Charger Pad",
    category: "Electronics Accessories",
    unit: "Units",
    supplierName: "ElectroCorp Ltd.",
    leadTimeDays: 15,
    minOrderQty: 50,
    orderMultiple: 10,
    unitCost: 22.50,
    targetSL: 0.95
  },
  {
    skuCode: "SKU003",
    skuName: "Ergonomic Pro Task Chair",
    category: "Office Furniture",
    unit: "Units",
    supplierName: "ComfortSeat Mfg.",
    leadTimeDays: 30,
    minOrderQty: 10,
    orderMultiple: 2,
    unitCost: 110.00,
    targetSL: 0.95
  },
  {
    skuCode: "SKU004",
    skuName: "8-in-1 USB-C Multiport Hub",
    category: "Electronics Accessories",
    unit: "Units",
    supplierName: "ElectroCorp Ltd.",
    leadTimeDays: 12,
    minOrderQty: 40,
    orderMultiple: 10,
    unitCost: 18.00,
    targetSL: 0.90
  },
  {
    skuCode: "SKU005",
    skuName: "Organic Ceremonial Matcha (100g)",
    category: "Food & Beverage",
    unit: "Tins",
    supplierName: "ZenTea Wholesalers",
    leadTimeDays: 20,
    minOrderQty: 50,
    orderMultiple: 5,
    unitCost: 28.00,
    targetSL: 0.95
  },
  {
    skuCode: "SKU006",
    skuName: "Backlit Mechanical Keyboard",
    category: "Computer Hardware",
    unit: "Units",
    supplierName: "TypeTech Solutions",
    leadTimeDays: 14,
    minOrderQty: 20,
    orderMultiple: 5,
    unitCost: 45.00,
    targetSL: 0.90
  },
  {
    skuCode: "SKU007",
    skuName: "Smart Wireless Room Thermostat",
    category: "Home Automation",
    unit: "Units",
    supplierName: "ElectroCorp Ltd.",
    leadTimeDays: 18,
    minOrderQty: 15,
    orderMultiple: 5,
    unitCost: 85.00,
    targetSL: 0.90
  },
  {
    skuCode: "SKU008",
    skuName: "Custom Double-Shot PBT Keycaps",
    category: "Computer Hardware",
    unit: "Sets",
    supplierName: "TypeTech Solutions",
    leadTimeDays: 25,
    minOrderQty: 10,
    orderMultiple: 1,
    unitCost: 8.50,
    targetSL: 0.85
  }
];

// 12 Months of historical data for each SKU (July 2025 to June 2026)
const months = [
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
  "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"
];

// Helper to generate a sequence
const createDemandSeq = (skuCode: string, values: number[]): DemandHistoryItem[] => {
  return months.map((m, idx) => ({
    id: `REC-${skuCode}-${m}`,
    skuCode,
    periodDate: m,
    demandQty: values[idx] || 0
  }));
};

export const initialDemandHistory: DemandHistoryItem[] = [
  // SKU001: Premium Arabica Coffee Beans (AX - High volume, highly stable: mean 550, low SD)
  ...createDemandSeq("SKU001", [540, 560, 550, 530, 570, 550, 545, 555, 560, 535, 565, 540]),

  // SKU002: Qi Fast Wireless Charger Pad (AY - High volume, seasonal/trend: mean 500, med SD)
  ...createDemandSeq("SKU002", [350, 380, 420, 500, 650, 780, 450, 400, 480, 510, 580, 500]),

  // SKU003: Ergonomic Pro Task Chair (BX - Medium volume, stable: mean 90, low SD)
  ...createDemandSeq("SKU003", [92, 88, 90, 85, 95, 90, 87, 89, 94, 91, 93, 86]),

  // SKU004: 8-in-1 USB-C Multiport Hub (BY - Medium volume, volatile: mean 70, high SD)
  ...createDemandSeq("SKU004", [40, 25, 90, 110, 150, 45, 30, 85, 120, 50, 60, 35]),

  // SKU005: Organic Ceremonial Matcha (100g) (AZ - High volume, sporadic/intermittent: bursts)
  ...createDemandSeq("SKU005", [0, 800, 0, 0, 1000, 0, 0, 900, 0, 0, 900, 0]),

  // SKU006: Backlit Mechanical Keyboard (CX - Low volume, stable: mean 20, low SD)
  ...createDemandSeq("SKU006", [21, 19, 20, 18, 22, 20, 19, 21, 20, 22, 18, 20]),

  // SKU007: Smart Wireless Room Thermostat (CY - Low volume, variable: mean 15, med SD)
  ...createDemandSeq("SKU007", [10, 8, 15, 22, 28, 30, 12, 10, 14, 15, 8, 8]),

  // SKU008: Custom Double-Shot PBT Keycaps (CZ - Low volume, highly sporadic: mean 5)
  ...createDemandSeq("SKU008", [0, 0, 25, 0, 0, 35, 0, 0, 0, 0, 0, 0])
];

export const initialInventoryData: InventoryDataItem[] = [
  { skuCode: "SKU001", onHandQty: 450, onOrderQty: 200, allocatedQty: 50 },
  { skuCode: "SKU002", onHandQty: 80, onOrderQty: 150, allocatedQty: 20 },
  { skuCode: "SKU003", onHandQty: 120, onOrderQty: 0, allocatedQty: 15 },
  { skuCode: "SKU004", onHandQty: 12, onOrderQty: 40, allocatedQty: 5 },
  { skuCode: "SKU005", onHandQty: 550, onOrderQty: 0, allocatedQty: 80 },
  { skuCode: "SKU006", onHandQty: 8, onOrderQty: 20, allocatedQty: 2 },
  { skuCode: "SKU007", onHandQty: 3, onOrderQty: 0, allocatedQty: 1 },
  { skuCode: "SKU008", onHandQty: 2, onOrderQty: 0, allocatedQty: 0 }
];
