import React from 'react';
import { Car, Sparkles, Check, X, Search } from 'lucide-react';
import { VehicleFilterState, Listing } from '../types';

interface QuickBrandBarProps {
  filters: VehicleFilterState;
  setFilters: React.Dispatch<React.SetStateAction<VehicleFilterState>>;
  listings: Listing[];
}

// Major car & truck brands in South Africa with badges
const POPULAR_BRANDS = [
  { name: 'Toyota', emoji: '🔴', tag: 'Hilux, Fortuner, Quantum, Corolla' },
  { name: 'Volkswagen', emoji: '🔵', tag: 'Polo, Golf, Amarok, Caddy' },
  { name: 'Ford', emoji: '🔷', tag: 'Ranger, Everest, Fiesta' },
  { name: 'BMW', emoji: '⚪', tag: '3-Series, 1-Series, X5, F30' },
  { name: 'Isuzu', emoji: '🔴', tag: 'D-Max, KB250, KB300, NPR Truck' },
  { name: 'Mercedes-Benz', emoji: '⭐', tag: 'Actros, Axor, C-Class, Sprinter' },
  { name: 'Nissan', emoji: '⚪', tag: 'NP200, Hardbody, Navara' },
  { name: 'Hyundai', emoji: '🔹', tag: 'H100 Bakkie, i20, Tucson' },
];

// Frequent search shortcut chips for common SA vehicle parts
const FREQUENT_SEARCHES = [
  { label: '🔥 Hilux 2.8 GD-6 Engine', query: '1GD-FTV' },
  { label: '⚙️ Polo Vivo 02T Gearbox', query: '02T' },
  { label: '🛻 Ranger Diff with E-Lock', query: 'axle' },
  { label: '💡 BMW F30 Xenon Headlight', query: 'headlight' },
  { label: '🚛 Actros Air Brake Caliper', query: 'caliper' },
  { label: '💨 Isuzu D-Max Turbocharger', query: 'turbo' },
  { label: '🛑 Heavy Duty Calipers', query: 'caliper' },
];

export const QuickBrandBar: React.FC<QuickBrandBarProps> = ({
  filters,
  setFilters,
  listings
}) => {
  // Count parts per brand
  const getBrandCount = (brandName: string) => {
    return listings.filter(
      item => item.make.toLowerCase() === brandName.toLowerCase()
    ).length;
  };

  const handleToggleBrand = (brandName: string) => {
    if (filters.make.toLowerCase() === brandName.toLowerCase()) {
      // Deselect brand
      setFilters(prev => ({ ...prev, make: '', model: '' }));
    } else {
      // Select brand & reset model
      setFilters(prev => ({ ...prev, make: brandName, model: '' }));
    }
  };

  const handleQuickSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  return (
    <div className="mb-4 space-y-2.5">
      
      {/* 1. Quick Select by Popular Brand */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <Car className="w-3.5 h-3.5 text-amber-400" />
          <span className="uppercase tracking-wider text-[11px]">Popular Makes in South Africa:</span>
        </div>

        {filters.make && (
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, make: '', model: '' }))}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 cursor-pointer"
          >
            <span>Reset Make ({filters.make})</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Horizontal Brand Pills Scrollable */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, make: '', model: '' }))}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
            !filters.make
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
        >
          All Makes ({listings.length})
        </button>

        {POPULAR_BRANDS.map(brand => {
          const count = getBrandCount(brand.name);
          const isSelected = filters.make.toLowerCase() === brand.name.toLowerCase();

          return (
            <button
              key={brand.name}
              type="button"
              onClick={() => handleToggleBrand(brand.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800/90 text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
              title={`${brand.name} (${brand.tag})`}
            >
              <span>{brand.emoji}</span>
              <span>{brand.name}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Frequent Search Shortcuts (One-Click Auto-Fill) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-thin scrollbar-thumb-slate-800 text-[11px]">
        <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick queries:</span>
        </span>
        {FREQUENT_SEARCHES.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleQuickSearch(item.query)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

    </div>
  );
};
