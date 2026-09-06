import React from 'react';
import { 
  DollarSign, 
  Box, 
  ShieldCheck, 
  RotateCcw, 
  Car, 
  Check, 
  Layers, 
  Building2, 
  Warehouse, 
  X,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { PriceRangeSlider } from './PriceRangeSlider';
import { SouthAfricanProvince } from '../types';

interface BuyerCatalogSidebarProps {
  filters: {
    search: string;
    vehicleType: string;
    make: string;
    model: string;
    year: string;
    yearMin: number | '';
    yearMax: number | '';
    category: string;
    province: SouthAfricanProvince | '';
    scrapyardHub: string;
    condition: string;
    conditionGroup: 'used' | 'reconditioned' | 'new' | '';
    minPrice: number | '';
    maxPrice: number | '';
    sortBy: string;
    verifiedOnly: boolean;
    inStockOnly: boolean;
    featuredOnly: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  matchingCount: number;
  resetFilters: () => void;
  onCloseMobile?: () => void;
  className?: string;
}

export const BuyerCatalogSidebar: React.FC<BuyerCatalogSidebarProps> = ({
  filters,
  setFilters,
  matchingCount,
  resetFilters,
  onCloseMobile,
  className = ''
}) => {
  const hasActivePriceFilter = filters.minPrice !== '' || filters.maxPrice !== '';
  const hasActiveFilters = 
    hasActivePriceFilter || 
    Boolean(filters.conditionGroup) || 
    Boolean(filters.condition) || 
    Boolean(filters.verifiedOnly) || 
    Boolean(filters.inStockOnly) ||
    Boolean(filters.category) ||
    Boolean(filters.province) ||
    Boolean(filters.scrapyardHub);

  return (
    <div className={`space-y-4 ${className}`} id="buyer-catalog-sidebar-panel">
      {/* Mobile Drawer Header (if rendered inside mobile drawer) */}
      {onCloseMobile && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white">Filter & Budget</h3>
          </div>
          <button
            type="button"
            id="close-mobile-filter-drawer-btn"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close filter drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Filter Suite Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Refine Spares
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            id="sidebar-clear-all-filters-btn"
            onClick={resetFilters}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            title="Reset all filter criteria"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. PRIMARY FEATURE: REAL-TIME PRICE BUDGET RANGE SLIDER */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4 shadow-xl">
        <PriceRangeSlider
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onChange={(min, max) => {
            setFilters((prev: any) => ({
              ...prev,
              minPrice: min,
              maxPrice: max
            }));
          }}
          maxLimit={80000}
          step={500}
          matchingCount={matchingCount}
          showPresets={true}
        />
      </div>

      {/* 2. PART CONDITION SELECTOR */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-amber-500" />
            <span>Part Condition</span>
          </label>
          {(filters.conditionGroup || filters.condition) && (
            <button
              type="button"
              id="sidebar-clear-condition-btn"
              onClick={() => setFilters((prev: any) => ({ ...prev, conditionGroup: '', condition: '' }))}
              className="text-[11px] text-slate-400 hover:text-amber-400 underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {[
            { id: '', label: 'All Conditions' },
            { id: 'used', label: 'OEM Stripped / Used' },
            { id: 'reconditioned', label: 'Reconditioned & Tested' },
            { id: 'new', label: 'Brand New Replacement' }
          ].map(cond => {
            const isSelected = 
              filters.conditionGroup === cond.id || 
              (!filters.conditionGroup && cond.id === '');
            return (
              <button
                key={cond.id}
                type="button"
                id={`sidebar-condition-${cond.id || 'all'}-btn`}
                onClick={() => setFilters((prev: any) => ({ 
                  ...prev, 
                  conditionGroup: cond.id as any, 
                  condition: '' 
                }))}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                    : 'bg-slate-950/70 hover:bg-slate-800/90 text-slate-300 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span>{cond.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VERIFIED SUPPLIER & STOCK AVAILABILITY TOGGLES */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-2.5">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Trust & Inventory</span>
        </label>

        <label 
          htmlFor="sidebar-verified-only-checkbox"
          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:bg-slate-850 hover:border-slate-700 transition-colors"
        >
          <input
            id="sidebar-verified-only-checkbox"
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => setFilters((prev: any) => ({ ...prev, verifiedOnly: e.target.checked }))}
            className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
          />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-200 block">Verified Yards Only</span>
            <span className="text-[10px] text-slate-400 block">Accredited South African suppliers</span>
          </div>
        </label>

        <label 
          htmlFor="sidebar-in-stock-only-checkbox"
          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:bg-slate-850 hover:border-slate-700 transition-colors"
        >
          <input
            id="sidebar-in-stock-only-checkbox"
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((prev: any) => ({ ...prev, inStockOnly: e.target.checked }))}
            className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
          />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-200 block">In-Stock Ready to Ship</span>
            <span className="text-[10px] text-slate-400 block">Immediate dispatch & courier</span>
          </div>
        </label>
      </div>

      {/* 4. ACTIVE VEHICLE / LOCATION SUMMARY BADGES (IF ACTIVE) */}
      {(filters.make || filters.province || filters.scrapyardHub) && (
        <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Target Specs
          </span>

          {filters.make && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Car className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">
                  {filters.make} {filters.model ? `• ${filters.model}` : ''}
                </span>
              </div>
              <button
                type="button"
                id="sidebar-clear-make-btn"
                onClick={() => setFilters((prev: any) => ({ ...prev, make: '', model: '' }))}
                className="text-[11px] text-amber-400 hover:text-amber-300 ml-2 shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {filters.province && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">
                  {filters.province}
                </span>
              </div>
              <button
                type="button"
                id="sidebar-clear-province-btn"
                onClick={() => setFilters((prev: any) => ({ ...prev, province: '', scrapyardHub: '' }))}
                className="text-[11px] text-amber-400 hover:text-amber-300 ml-2 shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {filters.scrapyardHub && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Warehouse className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-200 truncate">
                  Hub: {filters.scrapyardHub}
                </span>
              </div>
              <button
                type="button"
                id="sidebar-clear-hub-btn"
                onClick={() => setFilters((prev: any) => ({ ...prev, scrapyardHub: '' }))}
                className="text-[11px] text-amber-400 hover:text-amber-300 ml-2 shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer Confirmation Action */}
      {onCloseMobile && (
        <div className="pt-3">
          <button
            type="button"
            id="mobile-drawer-apply-budget-btn"
            onClick={onCloseMobile}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
          >
            Show {matchingCount} {matchingCount === 1 ? 'Part' : 'Parts'} in Budget
          </button>
        </div>
      )}
    </div>
  );
};
