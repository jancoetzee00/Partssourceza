import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Car, 
  Search, 
  GitCompare, 
  HelpCircle, 
  Store,
  ShieldCheck,
  Lock
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { 
    role, 
    setRole, 
    compareList, 
    setIsCompareOpen, 
    setIsRequestPartOpen,
    openSellerAuth,
    currentSeller
  } = useApp();

  const scrollToSearch = () => {
    if (role !== 'buyer') {
      setRole('buyer');
      setTimeout(() => {
        const searchElem = document.getElementById('catalog-search-input');
        if (searchElem) {
          searchElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          searchElem.focus();
        }
      }, 100);
    } else {
      const searchElem = document.getElementById('catalog-search-input');
      if (searchElem) {
        searchElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchElem.focus();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        
        {/* 1. Marketplace */}
        <button
          type="button"
          onClick={() => {
            setRole('buyer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            role === 'buyer'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${role === 'buyer' ? 'bg-amber-500/20 text-amber-400' : ''}`}>
            <Car className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Spares</span>
        </button>

        {/* 2. Search / Quick Filter */}
        <button
          type="button"
          onClick={scrollToSearch}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-amber-400 transition-all"
        >
          <div className="p-1 rounded-lg hover:bg-slate-800">
            <Search className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Search</span>
        </button>

        {/* 3. Compare with Counter Badge */}
        <button
          type="button"
          onClick={() => setIsCompareOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-amber-400 transition-all"
        >
          <div className="p-1 rounded-lg hover:bg-slate-800 relative">
            <GitCompare className="w-4 h-4" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {compareList.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Compare</span>
        </button>

        {/* 4. Request Rare Part */}
        <button
          type="button"
          onClick={() => setIsRequestPartOpen(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-purple-400 transition-all"
        >
          <div className="p-1 rounded-lg hover:bg-slate-800">
            <HelpCircle className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 text-purple-300 font-medium">Request</span>
        </button>

        {/* 5. Scrap Yard / Seller Portal */}
        <button
          type="button"
          onClick={() => {
            if (role === 'seller') {
              setRole('buyer');
            } else {
              setRole('seller');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            role === 'seller'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${role === 'seller' ? 'bg-amber-500/20 text-amber-400' : ''}`}>
            <Store className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Sell Spares</span>
        </button>

      </div>
    </div>
  );
};
