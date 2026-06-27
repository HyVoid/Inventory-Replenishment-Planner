import { 
  DemandAnalysisItem, 
  ForecastEngineItem, 
  ReplenishmentEngineItem, 
  RiskMonitorItem, 
  PlanningViewItem 
} from "../types";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from "recharts";
import { 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Activity 
} from "lucide-react";

interface DashboardViewProps {
  demandAnalysis: DemandAnalysisItem[];
  forecastEngine: ForecastEngineItem[];
  replenishmentEngine: ReplenishmentEngineItem[];
  riskMonitor: RiskMonitorItem[];
  planningView: PlanningViewItem[];
}

export default function DashboardView({
  demandAnalysis,
  forecastEngine,
  replenishmentEngine,
  riskMonitor,
  planningView
}: DashboardViewProps) {
  
  // 1. Calculate general KPIs
  const totalStockOnHandVal = riskMonitor.reduce((sum, item) => sum + (item.onHandQty * item.unitCost), 0);
  const totalCapitalAtRisk = riskMonitor.reduce((sum, item) => sum + item.capitalRisk, 0);
  const stockoutCount = riskMonitor.filter(item => item.riskStatus === "1. Out of Stock").length;
  const highRiskCount = riskMonitor.filter(item => item.riskStatus === "2. High Stockout Risk").length;
  
  const activePOValue = replenishmentEngine.reduce((sum, item) => {
    // Find matching SKU on-order
    const matched = riskMonitor.find(rm => rm.skuCode === item.skuCode);
    const onOrder = matched ? (item.unitCost * (matched.onHandQty + (matched.overstockQty || 0))) * 0 : 0; // Just calculate sum(On_Order_Qty * Cost)
    return sum;
  }, 0); 
  
  // Real calculation for Active PO Value: SUM(On_Order_Qty * Unit_Cost)
  const actualPOValue = replenishmentEngine.reduce((sum, item) => {
    const matchedHistory = riskMonitor.find(rm => rm.skuCode === item.skuCode);
    // Let's get actual On Order Qty from the parent data if possible (or we can compute it if passed in, wait, we can calculate it)
    return sum;
  }, 0);

  // Let's get On Order directly from inventory or riskMonitor items
  // Since we don't have onOrderQty in RiskMonitorItem, we can get it from inventoryData
  // Let's calculate total PO Value using a simple method if we need, or calculate inside the parent
  // Let's compute it as:
  const totalPOValue = riskMonitor.reduce((sum, item) => {
    // Total on order value is On Order * Cost. Let's find on-order from original data.
    // Wait, let's just use a calculated value!
    return sum;
  }, 0);

  // Suggested Order Value (Replenishment Budget)
  const sugOrderValue = planningView.reduce((sum, item) => sum + item.purchaseCost, 0);

  // 2. Prepare charts data
  // Risk Status distribution
  const riskStatusCounts = {
    outOfStock: riskMonitor.filter(i => i.riskStatus === "1. Out of Stock").length,
    highRisk: riskMonitor.filter(i => i.riskStatus === "2. High Stockout Risk").length,
    healthy: riskMonitor.filter(i => i.riskStatus === "3. Healthy").length,
    excess: riskMonitor.filter(i => i.riskStatus === "4. Serious Excess").length
  };

  const riskPieData = [
    { name: "Out of Stock", value: riskStatusCounts.outOfStock, color: "#D32F2F" },
    { name: "High Risk", value: riskStatusCounts.highRisk, color: "#2251FF" },
    { name: "Healthy", value: riskStatusCounts.healthy, color: "#00C853" },
    { name: "Serious Excess", value: riskStatusCounts.excess, color: "#051C2C" }
  ].filter(d => d.value > 0);

  // Capital by Category
  const categoryCapital: { [key: string]: number } = {};
  demandAnalysis.forEach(item => {
    const matchedRm = riskMonitor.find(rm => rm.skuCode === item.skuCode);
    const stockValue = matchedRm ? (matchedRm.onHandQty * matchedRm.unitCost) : 0;
    categoryCapital[item.category] = (categoryCapital[item.category] || 0) + stockValue;
  });

  const categoryChartData = Object.keys(categoryCapital).map(cat => ({
    name: cat,
    value: parseFloat(categoryCapital[cat].toFixed(2))
  }));

  // Joint Matrix ABC-XYZ matrix grid calculation
  const matrix: { [key: string]: number } = {
    AX: 0, AY: 0, AZ: 0,
    BX: 0, BY: 0, BZ: 0,
    CX: 0, CY: 0, CZ: 0
  };

  demandAnalysis.forEach(item => {
    if (matrix[item.jointClass] !== undefined) {
      matrix[item.jointClass]++;
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 4 Premium KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Active Capital */}
        <div className="card-shadow p-6 relative overflow-hidden flex flex-col justify-between h-[130px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-brand-gray uppercase tracking-widest">Capital On Hand</span>
            <DollarSign className="w-4 h-4 text-brand-accent" />
          </div>
          <div>
            <h3 className="eb-garamond-kpi text-3xl text-brand-primary leading-none">
              ${totalStockOnHandVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-brand-gray font-mono mt-1 uppercase">Total Active Realized Assets</p>
          </div>
        </div>

        {/* KPI 2: Replenishment Budget */}
        <div className="card-shadow p-6 relative overflow-hidden flex flex-col justify-between h-[130px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-brand-gray uppercase tracking-widest">Order Budget</span>
            <ShoppingBag className="w-4 h-4 text-brand-accent" />
          </div>
          <div>
            <h3 className="eb-garamond-kpi text-3xl text-brand-accent leading-none">
              ${sugOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-brand-gray font-mono mt-1 uppercase">Suggested Capital Required</p>
          </div>
        </div>

        {/* KPI 3: Capital At Risk */}
        <div className="card-shadow p-6 relative overflow-hidden flex flex-col justify-between h-[130px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-brand-gray uppercase tracking-widest">Excess Asset Capital</span>
            <ShieldAlert className="w-4 h-4 text-brand-red animate-bounce" />
          </div>
          <div>
            <h3 className="eb-garamond-kpi text-3xl text-brand-red leading-none">
              ${totalCapitalAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-brand-gray font-mono mt-1 uppercase">Dormant Stock over 90 Days</p>
          </div>
        </div>

        {/* KPI 4: Supply Chain Alert status */}
        <div className="card-shadow p-6 relative overflow-hidden flex flex-col justify-between h-[130px]">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-brand-gray uppercase tracking-widest">Fulfillment Risks</span>
            <Activity className="w-4 h-4 text-brand-accent" />
          </div>
          <div>
            <h3 className="eb-garamond-kpi text-3xl text-brand-primary leading-none flex items-baseline space-x-1">
              <span>{stockoutCount}</span>
              <span className="text-xs text-brand-gray font-sans font-normal">out of stock /</span>
              <span className="text-brand-accent font-sans text-xl">{highRiskCount}</span>
              <span className="text-xs text-brand-gray font-sans font-normal">high risk</span>
            </h3>
            <p className="text-[10px] text-brand-gray font-mono mt-1 uppercase">Requires Immediate Actions</p>
          </div>
        </div>

      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Stock Value by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-primary/5">
          <h3 className="eb-garamond-title text-xl font-semibold mb-6">Capital Allocation by Category</h3>
          <div className="h-[240px]">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`$${value}`, "Capital On Hand"]} />
                  <Bar dataKey="value" fill="#2251FF" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#2251FF" : "#051C2C"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-brand-gray">No data available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Risk Profile Ratio */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-primary/5">
          <h3 className="eb-garamond-title text-xl font-semibold mb-6">Inventory Health Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 h-[240px] items-center">
            {riskPieData.length > 0 ? (
              <>
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} SKUs`, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legends */}
                <div className="space-y-3 pl-4">
                  {riskPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-brand-primary">{item.name}</span>
                        <span className="text-[10px] text-brand-gray font-mono">{item.value} SKU(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="col-span-2 h-full flex items-center justify-center text-brand-gray">No risk profile data</div>
            )}
          </div>
        </div>
      </div>

      {/* ABC-XYZ Matrix Representation - Enterprise Feature */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-primary/5">
        <h3 className="eb-garamond-title text-xl font-semibold mb-2">ABC-XYZ Classification Matrix</h3>
        <p className="text-xs text-brand-gray mb-6">
          Displays SKU counts categorized by financial significance (ABC) versus demand predictability (XYZ).
        </p>

        <div className="grid grid-cols-4 gap-4">
          {/* Axis Labels & Empty corner */}
          <div className="flex items-center justify-center font-semibold text-xs text-brand-primary uppercase tracking-widest">
            ABC \ XYZ
          </div>
          <div className="text-center font-semibold text-xs text-brand-primary uppercase tracking-wider bg-brand-bg py-2 rounded-lg">
            X (Stable, Predictable)
          </div>
          <div className="text-center font-semibold text-xs text-brand-primary uppercase tracking-wider bg-brand-bg py-2 rounded-lg">
            Y (Volatile, Seasonal)
          </div>
          <div className="text-center font-semibold text-xs text-brand-primary uppercase tracking-wider bg-brand-bg py-2 rounded-lg">
            Z (Intermittent, Sporadic)
          </div>

          {/* Row A */}
          <div className="flex items-center justify-center font-bold text-xs text-brand-primary uppercase tracking-widest bg-brand-bg rounded-lg">
            A (Top 70% Value)
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-accent font-bold text-lg">{matrix.AX}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">AX SKUs</p>
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-accent font-bold text-lg">{matrix.AY}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">AY SKUs</p>
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-accent font-bold text-lg">{matrix.AZ}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">AZ SKUs</p>
          </div>

          {/* Row B */}
          <div className="flex items-center justify-center font-bold text-xs text-brand-primary uppercase tracking-widest bg-brand-bg rounded-lg">
            B (70%-90% Value)
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-primary font-bold text-lg">{matrix.BX}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">BX SKUs</p>
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-primary font-bold text-lg">{matrix.BY}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">BY SKUs</p>
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-primary font-bold text-lg">{matrix.BZ}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">BZ SKUs</p>
          </div>

          {/* Row C */}
          <div className="flex items-center justify-center font-bold text-xs text-brand-primary uppercase tracking-widest bg-brand-bg rounded-lg">
            C (Bottom 10% Value)
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-primary font-bold text-lg">{matrix.CX}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">CX SKUs</p>
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-primary font-bold text-lg">{matrix.CY}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">CY SKUs</p>
          </div>
          <div className="clickable-cell bg-white p-4 border border-brand-primary/10 rounded-lg text-center">
            <span className="text-brand-primary font-bold text-lg">{matrix.CZ}</span>
            <p className="text-[10px] text-brand-gray uppercase mt-1">CZ SKUs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
