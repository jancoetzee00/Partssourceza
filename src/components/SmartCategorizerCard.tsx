import React, { useState } from 'react';
import { 
  Sparkles, 
  Scan, 
  Zap, 
  Check, 
  CheckCircle2, 
  Car, 
  DollarSign, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Info, 
  ShieldCheck, 
  ArrowRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { SmartCategorizationResult, formatZAR, scanAndAutoCategorizePart } from '../utils/autoCategorizer';
import { PartCategory, PartCondition, VehicleType } from '../types';

interface SmartCategorizerCardProps {
  currentImage?: string;
  currentTitle: string;
  currentCategory: PartCategory;
  onApplyAll: (result: SmartCategorizationResult) => void;
  onApplyPriceOnly?: (priceZAR: number) => void;
  onApplyCategoryOnly?: (category: PartCategory) => void;
  onApplyVehicleOnly?: (vehicle: { make: string; model: string; vehicleType: VehicleType; yearStart: number; yearEnd: number; engineSpec: string }) => void;
}

export const SmartCategorizerCard: React.FC<SmartCategorizerCardProps> = ({
  currentImage,
  currentTitle,
  currentCategory,
  onApplyAll,
  onApplyPriceOnly,
  onApplyCategoryOnly,
  onApplyVehicleOnly,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [result, setResult] = useState<SmartCategorizationResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSelectiveOptions, setShowSelectiveOptions] = useState(false);
  const [selectedPriceMode, setSelectedPriceMode] = useState<'recommended' | 'low' | 'high'>('recommended');

  // Selective field toggles
  const [applyFields, setApplyFields] = useState({
    category: true,
    vehicle: true,
    price: true,
    title: true,
    condition: true,
    fitmentNotes: true,
  });

  const handleStartScan = async () => {
    if (!currentImage) return;

    setIsScanning(true);
    setScanStep('Analyzing part visual geometry & casing details...');

    // Simulate responsive stepping for clear user feedback
    const stepTimer1 = setTimeout(() => {
      setScanStep('Matching South African vehicle models & cross-fitments...');
    }, 600);

    const stepTimer2 = setTimeout(() => {
      setScanStep('Benchmarking ZAR scrapyard & aftermarket market rates...');
    }, 1200);

    try {
      const isBase64 = currentImage.startsWith('data:');
      const scanResult = await scanAndAutoCategorizePart({
        imageBase64: isBase64 ? currentImage : undefined,
        imageUrl: !isBase64 ? currentImage : undefined,
        currentTitle: currentTitle || undefined,
        currentCategory: currentCategory || undefined,
      });

      setResult(scanResult);
      setIsExpanded(true);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleApplySelected = () => {
    if (!result) return;

    // Calculate applied price based on chosen mode
    let chosenPrice = result.estimatedPriceZAR;
    if (selectedPriceMode === 'low') chosenPrice = result.priceRangeMinZAR;
    if (selectedPriceMode === 'high') chosenPrice = result.priceRangeMaxZAR;

    const modifiedResult: SmartCategorizationResult = {
      ...result,
      estimatedPriceZAR: chosenPrice,
    };

    onApplyAll(modifiedResult);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-2xl p-4 shadow-xl relative overflow-hidden transition-all">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                Smart Auto-Categorization & Price Range AI
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 uppercase tracking-wider">
                Automated Fill
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Scans your part photo to auto-detect vehicle make, model fitments, category, and South African market price (ZAR).
            </p>
          </div>
        </div>

        {/* Scan Trigger Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!currentImage ? (
            <span className="text-[11px] text-slate-400 italic bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              Upload or snap a photo first to scan
            </span>
          ) : (
            <button
              type="button"
              onClick={handleStartScan}
              disabled={isScanning}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer whitespace-nowrap ${
                isScanning
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/30 animate-pulse'
                  : result
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Photo...</span>
                </>
              ) : result ? (
                <>
                  <Scan className="w-3.5 h-3.5" />
                  <span>Re-Scan Image</span>
                </>
              ) : (
                <>
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scan Photo with AI</span>
                </>
              )}
            </button>
          )}

          {result && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-xl border border-slate-700/60 transition-colors"
              title={isExpanded ? 'Collapse results' : 'Expand results'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Scanning Live Feedback Bar */}
      {isScanning && (
        <div className="mt-4 p-3.5 bg-slate-950/80 rounded-xl border border-amber-500/30 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>{scanStep || 'AI inspecting component...'}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Gemini Vision 3.8
            </span>
          </div>
          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 h-full rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {/* Analysis Results Drawer */}
      {result && isExpanded && !isScanning && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
          {/* Top Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Category Detection */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-400" />
                    Part Category
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {Math.round(result.categoryConfidence * 100)}% Match
                  </span>
                </div>
                <div className="text-sm font-black text-slate-100">
                  {result.category}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {result.categoryReasoning}
                </p>
              </div>

              {onApplyCategoryOnly && (
                <button
                  type="button"
                  onClick={() => onApplyCategoryOnly(result.category)}
                  className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>Apply Category Only</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* 2. Compatible Vehicle Models */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Car className="w-3 h-3 text-sky-400" />
                    Vehicle Compatibility
                  </span>
                  <span className="text-[10px] font-bold text-sky-400 capitalize bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                    {result.vehicleType}
                  </span>
                </div>
                <div className="text-sm font-black text-slate-100">
                  {result.make} {result.primaryModel}
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                  {result.yearStart} - {result.yearEnd} • {result.engineSpec}
                </div>
              </div>

              {onApplyVehicleOnly && (
                <button
                  type="button"
                  onClick={() => onApplyVehicleOnly({
                    make: result.make,
                    model: result.primaryModel,
                    vehicleType: result.vehicleType,
                    yearStart: result.yearStart,
                    yearEnd: result.yearEnd,
                    engineSpec: result.engineSpec,
                  })}
                  className="mt-2 text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>Apply Vehicle Details</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* 3. Estimated Price Range in ZAR */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 flex flex-col justify-between bg-gradient-to-b from-amber-500/5 to-transparent">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-amber-400" />
                    Estimated Price (ZAR)
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    SA Market Index
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-amber-300 font-mono">
                    {formatZAR(
                      selectedPriceMode === 'recommended'
                        ? result.estimatedPriceZAR
                        : selectedPriceMode === 'low'
                        ? result.priceRangeMinZAR
                        : result.priceRangeMaxZAR
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (Range: {formatZAR(result.priceRangeMinZAR)} - {formatZAR(result.priceRangeMaxZAR)})
                  </span>
                </div>

                {/* Price Mode Selector Buttons */}
                <div className="flex gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPriceMode('low')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${
                      selectedPriceMode === 'low'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Low ({formatZAR(result.priceRangeMinZAR)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPriceMode('recommended')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${
                      selectedPriceMode === 'recommended'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    Fair ({formatZAR(result.estimatedPriceZAR)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPriceMode('high')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${
                      selectedPriceMode === 'high'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    High ({formatZAR(result.priceRangeMaxZAR)})
                  </button>
                </div>
              </div>

              {onApplyPriceOnly && (
                <button
                  type="button"
                  onClick={() => onApplyPriceOnly(
                    selectedPriceMode === 'recommended'
                      ? result.estimatedPriceZAR
                      : selectedPriceMode === 'low'
                      ? result.priceRangeMinZAR
                      : result.priceRangeMaxZAR
                  )}
                  className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>Apply This Price</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cross-Compatible Models & Pricing Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {/* Cross-Compatible Vehicles */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Cross-Compatible South African Models:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.compatibleModels.map((modelName, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 text-[10px] font-medium border border-slate-700 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    {modelName}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Rationale & OEM Dealership Benchmark */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  South African Valuation Rationale:
                </span>
                {result.newOemPriceZAR > 0 && (
                  <span className="text-[10px] text-emerald-300 font-bold">
                    Save ~{Math.round((1 - (result.estimatedPriceZAR / result.newOemPriceZAR)) * 100)}% vs New OEM ({formatZAR(result.newOemPriceZAR)})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {result.priceRationale}
              </p>
            </div>
          </div>

          {/* Suggested Title & Inspected Visual Traits */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  AI Suggested Listing Title:
                </span>
                <span className="text-xs font-bold text-slate-100">
                  {result.partName}
                </span>
              </div>
              {result.oemOrPartNumberHint && (
                <div className="self-start sm:self-auto">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    OEM Part #: <span className="text-amber-400 font-bold">{result.oemOrPartNumberHint}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Visual Traits */}
            {result.detectedVisualTraits && result.detectedVisualTraits.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-semibold">Identified Features:</span>
                {result.detectedVisualTraits.map((trait, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 text-[10px]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Master One-Click Auto-Fill Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Recommended Condition: <strong className="text-slate-200">{result.suggestedCondition}</strong> ({result.warrantyMonths} Mos. Warranty)
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleApplySelected}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-Fill All Fields into Listing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
