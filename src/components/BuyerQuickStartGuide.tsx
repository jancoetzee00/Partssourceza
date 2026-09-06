import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MessageCircle, 
  ShieldCheck, 
  HelpCircle, 
  X, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Truck,
  PhoneCall,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BuyerQuickStartGuide: React.FC = () => {
  const { setIsRequestPartOpen } = useApp();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('partsource_hide_buyer_guide') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('partsource_hide_buyer_guide', 'true');
  };

  const handleReopen = () => {
    setIsDismissed(false);
    localStorage.setItem('partsource_hide_buyer_guide', 'false');
  };

  if (isDismissed) {
    return (
      <div className="mb-4 flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">💡 Tip:</span>
          <span>Deal directly with verified scrap yards via WhatsApp. 0% middleman fees.</span>
        </div>
        <button
          type="button"
          onClick={handleReopen}
          className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] underline flex items-center gap-1 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>How It Works</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Banner Header */}
      <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>HOW TO GET CAR & TRUCK SPARES ON PART SOURCE ZA</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                100% Free for Buyers
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Direct connection to verified auto dismantlers and scrap yards nationwide. No hidden booking fees or commission.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss this guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Simple Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 relative z-10">
        
        {/* Step 1 */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
              1
            </div>
            <span className="text-xs font-bold text-white">Search & Filter</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Choose your vehicle make (Toyota, VW, Ford...), model, or your SA province.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
              2
            </div>
            <span className="text-xs font-bold text-white">Inspect Photos & Specs</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Browse multi-angle photos, OEM serials, test status, and warranty (1–12 months).
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
              3
            </div>
            <span className="text-xs font-bold text-emerald-400">Direct WhatsApp / Call</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Tap the WhatsApp button on any part to chat directly with the scrap yard manager.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-950/70 border border-purple-500/30 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-purple-500 text-white font-black text-[10px] flex items-center justify-center">
              4
            </div>
            <span className="text-xs font-bold text-purple-300">Can't Find It?</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug mb-1.5">
            Broadcast a free request to 14+ scrapyards across South Africa.
          </p>
          <button
            type="button"
            onClick={() => setIsRequestPartOpen(true)}
            className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline text-left cursor-pointer"
          >
            Post Free Part Request →
          </button>
        </div>

      </div>

      {/* Bottom Trust Strip */}
      <div className="mt-3 pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 relative z-10">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Vetted Local Scrapyards
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            Nationwide Courier Available
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            No registration needed to browse
          </span>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
        >
          Got it, don't show again
        </button>
      </div>

    </div>
  );
};
