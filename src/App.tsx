import React, { useState, useEffect, useMemo } from "react";
import { 
  ParameterItem, 
  SKUMasterItem, 
  DemandHistoryItem, 
  InventoryDataItem, 
  TabType,
  PlanningViewItem
} from "./types";
import { 
  initialParameters, 
  initialSKUMaster, 
  initialDemandHistory, 
  initialInventoryData 
} from "./initialData";
import { runReplenishmentCalculations } from "./utils/calculations";

import Header from "./components/Header";
import ReadMeView from "./components/ReadMeView";
import DashboardView from "./components/DashboardView";
import TableViews from "./components/TableViews";

export default function App() {
  // --- STATE PERSISTENCE LOAD ---
  const [params, setParams] = useState<ParameterItem[]>(() => {
    const local = localStorage.getItem("replenish_params");
    return local ? JSON.parse(local) : initialParameters;
  });

  const [skuMaster, setSkuMaster] = useState<SKUMasterItem[]>(() => {
    const local = localStorage.getItem("replenish_skus");
    return local ? JSON.parse(local) : initialSKUMaster;
  });

  const [demandHistory, setDemandHistory] = useState<DemandHistoryItem[]>(() => {
    const local = localStorage.getItem("replenish_history");
    return local ? JSON.parse(local) : initialDemandHistory;
  });

  const [inventoryData, setInventoryData] = useState<InventoryDataItem[]>(() => {
    const local = localStorage.getItem("replenish_inventory");
    return local ? JSON.parse(local) : initialInventoryData;
  });

  const [planningOverrides, setPlanningOverrides] = useState<{ [skuCode: string]: { selected: boolean; finalQty: number } }>(() => {
    const local = localStorage.getItem("replenish_planning_overrides");
    return local ? JSON.parse(local) : {};
  });

  const [currentTab, setCurrentTab] = useState<TabType>("README");
  const [lastSaved, setLastSaved] = useState<string>("");

  // --- AUTO SAVE EFFECT ---
  useEffect(() => {
    localStorage.setItem("replenish_params", JSON.stringify(params));
    localStorage.setItem("replenish_skus", JSON.stringify(skuMaster));
    localStorage.setItem("replenish_history", JSON.stringify(demandHistory));
    localStorage.setItem("replenish_inventory", JSON.stringify(inventoryData));
    localStorage.setItem("replenish_planning_overrides", JSON.stringify(planningOverrides));
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const dateStr = now.toISOString().split('T')[0];
    setLastSaved(`${dateStr} ${timeStr}`);
  }, [params, skuMaster, demandHistory, inventoryData, planningOverrides]);

  // --- WORKBOOK CALCULATION ENGINE (REACTIVE & PERSISTED) ---
  const results = useMemo(() => {
    const raw = runReplenishmentCalculations(params, skuMaster, demandHistory, inventoryData);
    
    // Merge overrides to planningView
    const updatedPlanning = raw.planningView.map(p => {
      const override = planningOverrides[p.skuCode];
      if (override !== undefined) {
        return {
          ...p,
          selected: override.selected,
          finalQty: override.finalQty,
          purchaseCost: parseFloat((override.finalQty * p.unitCost).toFixed(2))
        };
      }
      return p;
    });

    return {
      ...raw,
      planningView: updatedPlanning
    };
  }, [params, skuMaster, demandHistory, inventoryData, planningOverrides]);

  // Helper to handle planning view selections/quantities from table inputs
  const handleSetPlanningView = (updatedAction: any) => {
    if (typeof updatedAction === "function") {
      const nextPlanning = updatedAction(results.planningView);
      const newOverrides = { ...planningOverrides };
      nextPlanning.forEach((item: PlanningViewItem) => {
        newOverrides[item.skuCode] = {
          selected: item.selected,
          finalQty: item.finalQty
        };
      });
      setPlanningOverrides(newOverrides);
    } else {
      const newOverrides = { ...planningOverrides };
      updatedAction.forEach((item: PlanningViewItem) => {
        newOverrides[item.skuCode] = {
          selected: item.selected,
          finalQty: item.finalQty
        };
      });
      setPlanningOverrides(newOverrides);
    }
  };

  // --- BACKUP UTILITIES ---
  const handleExportBackup = () => {
    const backupObj = {
      params,
      skuMaster,
      demandHistory,
      inventoryData,
      planningOverrides
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ReplenishPro_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.params && parsed.skuMaster && parsed.demandHistory && parsed.inventoryData) {
          setParams(parsed.params);
          setSkuMaster(parsed.skuMaster);
          setDemandHistory(parsed.demandHistory);
          setInventoryData(parsed.inventoryData);
          if (parsed.planningOverrides) {
            setPlanningOverrides(parsed.planningOverrides);
          }
          alert("Backup successfully restored! Calculations updated instantly.");
        } else {
          alert("Invalid backup schema. Make sure you load a JSON file exported from ReplenishPro.");
        }
      } catch (err) {
        alert("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm("Reset Workbook State? All custom inputs and parameters will be reverted to initial premium demo data.")) {
      setParams(initialParameters);
      setSkuMaster(initialSKUMaster);
      setDemandHistory(initialDemandHistory);
      setInventoryData(initialInventoryData);
      setPlanningOverrides({});
      setCurrentTab("README");
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      {/* Top sticky horizontal header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lastSaved={lastSaved}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
        onReset={handleResetData}
      />

      {/* Main Content Area centered (Max width 1400px, 40px left/right padding) */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-10 py-8 space-y-8">
        
        {/* Render Views Dynamically based on spreadsheet tab page */}
        {currentTab === "README" && <ReadMeView />}
        
        {currentTab === "DASHBOARD" && (
          <DashboardView
            demandAnalysis={results.demandAnalysis}
            forecastEngine={results.forecastEngine}
            replenishmentEngine={results.replenishmentEngine}
            riskMonitor={results.riskMonitor}
            planningView={results.planningView}
          />
        )}

        {currentTab !== "README" && currentTab !== "DASHBOARD" && (
          <TableViews
            currentTab={currentTab}
            params={params}
            setParams={setParams}
            skuMaster={skuMaster}
            setSkuMaster={setSkuMaster}
            demandHistory={demandHistory}
            setDemandHistory={setDemandHistory}
            inventoryData={inventoryData}
            setInventoryData={setInventoryData}
            demandAnalysis={results.demandAnalysis}
            forecastEngine={results.forecastEngine}
            replenishmentEngine={results.replenishmentEngine}
            riskMonitor={results.riskMonitor}
            planningView={results.planningView}
            setPlanningView={handleSetPlanningView}
          />
        )}

      </main>

      {/* Footer Branding */}
      <footer className="w-full text-center py-6 text-[11px] text-brand-gray/80 border-t border-brand-primary/5 bg-white shrink-0">
        <div className="max-w-[1400px] mx-auto px-10 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 ReplenishPro SaaS Systems. Inspired by Statistical Supply Chain models.</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-accent">Engine: Static Normal CDF</p>
        </div>
      </footer>
    </div>
  );
}
