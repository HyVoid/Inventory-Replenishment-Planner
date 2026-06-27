import React, { useRef } from "react";
import { TabType } from "../types";
import { 
  Layers, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface HeaderProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  lastSaved: string;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  lastSaved,
  onExport,
  onImport,
  onReset
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { type: TabType; label: string }[] = [
    { type: "README", label: "Readme" },
    { type: "DASHBOARD", label: "Dashboard" },
    { type: "PARAM_SETUP", label: "Parameters" },
    { type: "SKU_MASTER", label: "SKU Master" },
    { type: "DEMAND_HISTORY", label: "Demand History" },
    { type: "INVENTORY_DATA", label: "Current Inventory" },
    { type: "DEMAND_ANALYSIS", label: "Demand Analysis" },
    { type: "FORECAST_ENGINE", label: "Forecast Engine" },
    { type: "REPLENISHMENT_ENGINE", label: "Replenishment Engine" },
    { type: "RISK_MONITOR", label: "Risk Monitor" },
    { type: "PLANNING_VIEW", label: "Planning View" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-[56px] bg-white border-b border-brand-primary/10 flex items-center justify-between px-6 shadow-sm">
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-2">
        <div className="bg-brand-primary p-1.5 rounded-lg text-white flex items-center justify-center">
          <Layers className="w-5 h-5 text-brand-accent animate-pulse" />
        </div>
        <div>
          <h1 className="eb-garamond-title text-lg font-bold text-brand-primary tracking-tight leading-none">
            Replenish<span className="text-brand-accent">Pro</span>
          </h1>
          <p className="text-[10px] text-brand-gray font-mono uppercase tracking-widest">SaaS Workbook</p>
        </div>
      </div>

      {/* Spreadsheet Tab Pages Navigation Selector */}
      <nav className="hidden lg:flex items-center h-full space-x-1 overflow-x-auto max-w-[55%]">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.type;
          return (
            <button
              key={tab.type}
              id={`tab-${tab.type}`}
              onClick={() => setCurrentTab(tab.type)}
              className={`h-full px-2.5 text-xs font-medium border-b-2 transition-all flex items-center shrink-0 hover:text-brand-accent ${
                isActive 
                  ? "border-brand-accent text-brand-accent font-semibold bg-brand-accent/5" 
                  : "border-transparent text-brand-primary/70"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Backup, Storage Actions & Last Saved Info */}
      <div className="flex items-center space-x-4">
        {/* Mobile Tab Selector */}
        <div className="lg:hidden">
          <select
            value={currentTab}
            onChange={(e) => setCurrentTab(e.target.value as TabType)}
            className="editable-input text-xs"
          >
            {tabs.map(tab => (
              <option key={tab.type} value={tab.type}>{tab.label}</option>
            ))}
          </select>
        </div>

        {/* Saved Status Indicator */}
        <div className="hidden sm:flex flex-col text-right">
          <div className="flex items-center space-x-1 text-[11px] text-brand-primary/70">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
            <span className="font-medium">Auto-saved</span>
          </div>
          <span className="text-[10px] text-brand-gray font-mono">Saved: {lastSaved}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            id="btn-export"
            onClick={onExport}
            title="Export State Backup JSON"
            className="p-1.5 rounded-lg text-brand-primary/80 hover:bg-brand-primary/5 hover:text-brand-accent transition-all flex items-center space-x-1 border border-brand-primary/10 bg-white"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">Export</span>
          </button>

          <button
            id="btn-import"
            onClick={() => fileInputRef.current?.click()}
            title="Import State Backup JSON"
            className="p-1.5 rounded-lg text-brand-primary/80 hover:bg-brand-primary/5 hover:text-brand-accent transition-all flex items-center space-x-1 border border-brand-primary/10 bg-white"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">Import</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onImport} 
            accept=".json" 
            className="hidden" 
          />

          <button
            id="btn-reset"
            onClick={onReset}
            title="Reset to Initial Premium Demo Data"
            className="p-1.5 rounded-lg text-brand-red/90 hover:bg-brand-red/10 transition-all flex items-center space-x-1 border border-brand-red/15 bg-white"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-medium">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
