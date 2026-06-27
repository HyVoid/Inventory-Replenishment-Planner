import { 
  BookOpen, 
  HelpCircle, 
  Settings, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  Database, 
  TrendingDown, 
  AlertCircle 
} from "lucide-react";

export default function ReadMeView() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro Block with Premium Styling */}
      <div className="insight-block space-y-3">
        <h2 className="eb-garamond-title text-2xl font-bold text-brand-primary">
          About ReplenishPro Dashboard & Workbook Engine
        </h2>
        <p className="text-sm leading-relaxed text-brand-primary/80">
          This system is a full-fledged <strong>SaaS Inventory Planning and Replenishment Decision Engine</strong> modeled after state-of-the-art enterprise spreadsheet planners. Underneath, a deterministic statistical engine translates demand history volatility and supply chain constraints into optimal replenishment policies.
        </p>
        <p className="text-sm leading-relaxed text-brand-primary/80">
          All calculations are completely processed inside your browser dynamically. Changing any parameter or SKU data propagates instantly across all dependent tabs.
        </p>
      </div>

      {/* Structured Flow Chart Representation */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-primary/5">
        <h3 className="eb-garamond-title text-xl font-semibold mb-6 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-brand-accent" />
          <span>Workbook Data Flow & Lifecycle</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-primary/10 relative flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm mb-3">1</div>
            <Database className="w-6 h-6 text-brand-primary mb-2" />
            <h4 className="font-semibold text-xs text-brand-primary uppercase tracking-wider">Data Input</h4>
            <p className="text-[11px] text-brand-gray mt-1">Configure parameters, SKU dimensions, and paste Sales History / Inventory snapshots.</p>
          </div>
          
          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-primary/10 relative flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm mb-3">2</div>
            <TrendingUp className="w-6 h-6 text-brand-accent mb-2" />
            <h4 className="font-semibold text-xs text-brand-primary uppercase tracking-wider">Statistical Engines</h4>
            <p className="text-[11px] text-brand-gray mt-1">Computes Coefficient of Variation, applies ABC-XYZ classifications, and selects forecast models.</p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-primary/10 relative flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm mb-3">3</div>
            <Settings className="w-6 h-6 text-brand-primary mb-2" />
            <h4 className="font-semibold text-xs text-brand-primary uppercase tracking-wider">Replenishment Calculations</h4>
            <p className="text-[11px] text-brand-gray mt-1">Applies NORMSINV service levels to derive Safety Stock (SS), Reorder Points (ROP) & Suggested Qty (SOQ).</p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-brand-accent/5 border border-brand-accent/20 relative flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center font-bold text-sm mb-3">4</div>
            <Layers className="w-6 h-6 text-brand-accent mb-2" />
            <h4 className="font-semibold text-xs text-brand-accent uppercase tracking-wider">SaaS Executions</h4>
            <p className="text-[11px] text-brand-accent mt-1">Monitors overstock & out-of-stock risks. Outputs a checklist in Planning View to trigger orders.</p>
          </div>
        </div>
      </div>

      {/* Detailed Sheet Mapping Reference */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-primary/5 space-y-4">
        <h3 className="eb-garamond-title text-xl font-semibold flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-brand-accent" />
          <span>Workbook Sheets Definition</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-brand-bg/25 border-l-2 border-brand-primary/40">
            <h4 className="font-semibold text-brand-primary text-xs uppercase tracking-wider">1. Parameters Setup (Parameter_Setup)</h4>
            <p className="text-xs text-brand-gray mt-1">Hosts global constants like target service levels (A: 98%, B: 95%, C: 90%), cumulative percentages, carrying rate, and control constraints.</p>
          </div>

          <div className="p-4 rounded-lg bg-brand-bg/25 border-l-2 border-brand-primary/40">
            <h4 className="font-semibold text-brand-primary text-xs uppercase tracking-wider">2. SKU Master (SKU_Master)</h4>
            <p className="text-xs text-brand-gray mt-1">Holds standard static attributes of your items, such as unit costs, categories, suppliers, Lead Time, and MOQs.</p>
          </div>

          <div className="p-4 rounded-lg bg-brand-bg/25 border-l-2 border-brand-primary/40">
            <h4 className="font-semibold text-brand-primary text-xs uppercase tracking-wider">3. Demand History & Inventory Data</h4>
            <p className="text-xs text-brand-gray mt-1">Stores 12 months of historical demand points and current stock snapshot (On Hand, On Order, Allocated) to compute real-time available inventory.</p>
          </div>

          <div className="p-4 rounded-lg bg-brand-bg/25 border-l-2 border-brand-primary/40">
            <h4 className="font-semibold text-brand-primary text-xs uppercase tracking-wider">4. Demand Analysis (Demand_Analysis)</h4>
            <p className="text-xs text-brand-gray mt-1">Calculates Monthly Mean, Standard Deviation, and Coefficient of Variation (CV). Automatically groups items into ABC-XYZ matrix classes.</p>
          </div>

          <div className="p-4 rounded-lg bg-brand-bg/25 border-l-2 border-brand-primary/40">
            <h4 className="font-semibold text-brand-primary text-xs uppercase tracking-wider">5. Forecast Engine (Forecast_Engine)</h4>
            <p className="text-xs text-brand-gray mt-1">Matches forecasting models based on CV: 3-Mo Moving Average (X), Weighted Moving Average (Y), and Median Smoothing (Z).</p>
          </div>

          <div className="p-4 rounded-lg bg-brand-bg/25 border-l-2 border-brand-primary/40">
            <h4 className="font-semibold text-brand-primary text-xs uppercase tracking-wider">6. Replenishment Engine (Replenishment_Engine)</h4>
            <p className="text-xs text-brand-gray mt-1">Determines Statistical Safety Stock, Reorder Point (ROP) thresholds, and final suggested order quantities (SOQ) aligning with MOQ & Multiple constraints.</p>
          </div>
        </div>
      </div>

      {/* Version Control & Operational Protocol */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-primary/5">
        <h3 className="eb-garamond-title text-xl font-semibold mb-4">Operational Protocol</h3>
        <ul className="space-y-2 text-xs text-brand-primary/80 list-disc list-inside">
          <li><strong>Data Ingestion:</strong> Import backups or add entries directly under tables to test various scenarios.</li>
          <li><strong>Instant Calculation:</strong> All tables recompute immediately. There's no need to trigger manual calculations.</li>
          <li><strong>Local Persistence:</strong> State is auto-saved in your web browser. Clearing cache will wipe state unless you export a backup JSON first.</li>
        </ul>
      </div>
    </div>
  );
}
