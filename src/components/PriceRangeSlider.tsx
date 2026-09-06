import React, { useCallback, useId } from 'react';
import { DollarSign, RotateCcw, Sparkles } from 'lucide-react';

interface PriceRangeSliderProps {
  minPrice: number | '';
  maxPrice: number | '';
  onChange: (min: number | '', max: number | '') => void;
  maxLimit?: number;
  step?: number;
  matchingCount?: number;
  showPresets?: boolean;
  compact?: boolean;
  className?: string;
}

const DEFAULT_MAX_LIMIT = 80000;
const DEFAULT_STEP = 500;

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minPrice,
  maxPrice,
  onChange,
  maxLimit = DEFAULT_MAX_LIMIT,
  step = DEFAULT_STEP,
  matchingCount,
  showPresets = true,
  compact = false,
  className = ''
}) => {
  const componentId = useId();

  // Resolved numeric values for the range slider
  const currentMin = minPrice === '' ? 0 : Number(minPrice);
  const currentMax = maxPrice === '' ? maxLimit : Math.min(Number(maxPrice), maxLimit);

  // Percentages for the colored track fill
  const minPercent = Math.min(100, Math.max(0, (currentMin / maxLimit) * 100));
  const maxPercent = Math.min(100, Math.max(0, (currentMax / maxLimit) * 100));

  const formatZAR = useCallback((val: number): string => {
    return `R${val.toLocaleString('en-ZA')}`;
  }, []);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const validMax = maxPrice === '' ? maxLimit : Number(maxPrice);
    // Maintain a small gap of step
    const newMin = Math.min(val, validMax - step);
    onChange(newMin <= 0 ? '' : newMin, maxPrice);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const validMin = minPrice === '' ? 0 : Number(minPrice);
    // Maintain a small gap of step
    const newMax = Math.max(val, validMin + step);
    onChange(minPrice, newMax >= maxLimit ? '' : newMax);
  };

  const handleManualMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('', maxPrice);
      return;
    }
    const val = Math.max(0, Number(raw));
    const validMax = maxPrice === '' ? maxLimit : Number(maxPrice);
    onChange(val, validMax);
  };

  const handleManualMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(minPrice, '');
      return;
    }
    const val = Math.max(0, Number(raw));
    onChange(minPrice, val);
  };

  const hasActivePriceFilter = minPrice !== '' || maxPrice !== '';

  const PRESETS = [
    { label: 'All Budgets', min: '' as const, max: '' as const },
    { label: '< R5k', min: '' as const, max: 5000 },
    { label: 'R5k – R15k', min: 5000, max: 15000 },
    { label: 'R15k – R35k', min: 15000, max: 35000 },
    { label: 'R35k+', min: 35000, max: '' as const }
  ];

  return (
    <div className={`space-y-3.5 ${className}`} id={`price-range-slider-${componentId}`}>
      {/* Header and Current Range Readout */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Price Budget (ZAR)
          </span>
        </div>

        {hasActivePriceFilter && (
          <button
            type="button"
            id={`reset-price-button-${componentId}`}
            onClick={() => onChange('', '')}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            title="Reset price filter to all amounts"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Live Active Range Indicator Badge */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
            Active Budget Range
          </span>
          <div className="text-sm font-black text-amber-400 font-mono truncate">
            {minPrice !== '' ? formatZAR(Number(minPrice)) : 'R0'}
            {' – '}
            {maxPrice !== '' ? formatZAR(Number(maxPrice)) : 'Unlimited'}
          </div>
        </div>

        {matchingCount !== undefined && (
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-medium">Matching</span>
            <span className="text-xs font-bold text-slate-200 font-mono bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
              {matchingCount} {matchingCount === 1 ? 'part' : 'parts'}
            </span>
          </div>
        )}
      </div>

      {/* Dual Thumb Range Slider Track */}
      <div className="pt-2 px-1">
        <div className="relative w-full h-8 flex items-center">
          {/* Base Track */}
          <div className="absolute w-full h-2 rounded-full bg-slate-800/90 border border-slate-700/60" />

          {/* Active Range Colored Bar */}
          <div
            className="absolute h-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.25)] transition-all"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`
            }}
          />

          {/* Dual Range Native Sliders */}
          <input
            type="range"
            id={`slider-min-${componentId}`}
            aria-label="Minimum budget in South African Rand"
            min={0}
            max={maxLimit}
            step={step}
            value={currentMin}
            onChange={handleMinChange}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20 cursor-pointer
              [&::-webkit-slider-thumb]:pointer-events-auto 
              [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-amber-400 
              [&::-webkit-slider-thumb]:border-2 
              [&::-webkit-slider-thumb]:border-slate-950 
              [&::-webkit-slider-thumb]:shadow-md 
              [&::-webkit-slider-thumb]:hover:scale-125 
              [&::-webkit-slider-thumb]:active:scale-110 
              [&::-webkit-slider-thumb]:transition-transform 
              [&::-webkit-slider-thumb]:appearance-none
              [&::-moz-range-thumb]:pointer-events-auto 
              [&::-moz-range-thumb]:w-4 
              [&::-moz-range-thumb]:h-4 
              [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-amber-400 
              [&::-moz-range-thumb]:border-2 
              [&::-moz-range-thumb]:border-slate-950 
              [&::-moz-range-thumb]:shadow-md 
              [&::-moz-range-thumb]:hover:scale-125"
          />

          <input
            type="range"
            id={`slider-max-${componentId}`}
            aria-label="Maximum budget in South African Rand"
            min={0}
            max={maxLimit}
            step={step}
            value={currentMax}
            onChange={handleMaxChange}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20 cursor-pointer
              [&::-webkit-slider-thumb]:pointer-events-auto 
              [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-amber-400 
              [&::-webkit-slider-thumb]:border-2 
              [&::-webkit-slider-thumb]:border-slate-950 
              [&::-webkit-slider-thumb]:shadow-md 
              [&::-webkit-slider-thumb]:hover:scale-125 
              [&::-webkit-slider-thumb]:active:scale-110 
              [&::-webkit-slider-thumb]:transition-transform 
              [&::-webkit-slider-thumb]:appearance-none
              [&::-moz-range-thumb]:pointer-events-auto 
              [&::-moz-range-thumb]:w-4 
              [&::-moz-range-thumb]:h-4 
              [&::-moz-range-thumb]:rounded-full 
              [&::-moz-range-thumb]:bg-amber-400 
              [&::-moz-range-thumb]:border-2 
              [&::-moz-range-thumb]:border-slate-950 
              [&::-moz-range-thumb]:shadow-md 
              [&::-moz-range-thumb]:hover:scale-125"
          />
        </div>

        {/* Track Milestone Scale Marks */}
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
          <span>R0</span>
          <span>R20k</span>
          <span>R40k</span>
          <span>R60k</span>
          <span>R{maxLimit >= 1000 ? `${maxLimit / 1000}k+` : maxLimit}</span>
        </div>
      </div>

      {/* Exact Manual Min & Max Numeric Inputs */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">
            Min (ZAR)
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
              R
            </span>
            <input
              type="number"
              id={`manual-min-price-${componentId}`}
              placeholder="0"
              min={0}
              max={maxLimit}
              step={step}
              value={minPrice}
              onChange={handleManualMinInput}
              className="w-full pl-6 pr-2 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">
            Max (ZAR)
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
              R
            </span>
            <input
              type="number"
              id={`manual-max-price-${componentId}`}
              placeholder="Unlimited"
              min={0}
              step={step}
              value={maxPrice}
              onChange={handleManualMaxInput}
              className="w-full pl-6 pr-2 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      {showPresets && (
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick Budget Presets</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset, idx) => {
              const isSelected = minPrice === preset.min && maxPrice === preset.max;
              return (
                <button
                  key={idx}
                  type="button"
                  id={`price-preset-${idx}-${componentId}`}
                  onClick={() => onChange(preset.min, preset.max)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
