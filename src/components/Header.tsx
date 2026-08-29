import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Car, 
  Truck, 
  Layers, 
  ShieldCheck, 
  PlusCircle, 
  GitCompare, 
  Heart, 
  Sparkles, 
  Building2, 
  Terminal, 
  Search, 
  HelpCircle,
  CreditCard,
  SlidersHorizontal,
  ChevronRight,
  Download,
  Smartphone,
  Monitor,
  Lock,
  Unlock,
  Globe
} from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const { 
    role, 
    setRole, 
    isDevApp, 
    setIsDevApp, 
    compareList, 
    setIsCompareOpen,
    favorites, 
    currentSeller, 
    setIsAddEditModalOpen, 
    setEditingListing,
    setIsSubscriptionModalOpen,
    setIsRequestPartOpen,
    setIsInstallModalOpen,
    isSearchEngineModalOpen,
    setIsSearchEngineModalOpen,
    isAdminAuthenticated,
    setIsAdminAuthModalOpen,
    logoutAdmin,
    filters,
    setFilters
  } = useApp();

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setRole('admin');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/30">
      {/* Dev App Environment Alert Banner */}
      {isDevApp && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/40 px-4 py-1.5 text-xs text-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            </span>
            <span className="font-bold tracking-wider uppercase text-[11px] text-amber-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              Dev Environment Active
            </span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              — Owner banking details configuration unlocked in Admin settings.
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button 
                onClick={() => setIsDevApp(!isDevApp)}
                title="Toggle Dev Mode simulator"
                className="text-[10px] px-2.5 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded text-indigo-300 font-mono transition-colors uppercase tracking-wider"
              >
                Dev Mode: Unlocked
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setRole('buyer')}>
            <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shadow-lg group-hover:border-amber-500/50 transition-colors">
              <span className="font-black text-amber-500 text-sm tracking-tighter">PS</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-amber-500 font-black text-lg sm:text-xl tracking-tighter">
                  PART SOURCE <span className="text-white">ZA</span>
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
                  🇿🇦 SA
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 -mt-0.5 font-semibold">
                Automotive Marketplace
              </p>
            </div>
          </div>

          {/* Center Quick Search */}
          {role === 'buyer' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search OEM numbers, brands or components..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-10 py-2 bg-slate-800/80 border border-slate-700/80 rounded-full text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Role Switcher & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Universal One-Click Install App Button (Mobile & Desktop) */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="relative px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm group"
              title="Install Part Source ZA for Mobile & Desktop"
            >
              <Download className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Install App</span>
              <span className="hidden xl:inline-block px-1.5 py-0.2 bg-amber-400/20 text-amber-300 rounded text-[9px] font-mono uppercase tracking-wider ml-0.5">
                📱+💻
              </span>
            </button>

            {/* Search Engine & SEO Web Exposure Hub Trigger */}
            <button
              onClick={() => setIsSearchEngineModalOpen(true)}
              className="relative px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-500/50 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm group"
              title="Search Engine Optimization & Google Web Indexing Hub"
            >
              <Globe className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline">Search Engine / SEO</span>
              <span className="md:hidden">SEO</span>
              <span className="hidden lg:inline-block px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold">
                Google
              </span>
            </button>

            {/* Compare Badge Trigger */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="relative px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Compare selected parts"
            >
              <GitCompare className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Compare</span>
              {compareList.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-slate-950 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.6)]">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Request Part for Buyers */}
            {role === 'buyer' && (
              <button
                onClick={() => setIsRequestPartOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Request Part</span>
              </button>
            )}

            {/* Seller Add Listing Quick Button */}
            {role === 'seller' && (
              <button
                onClick={() => {
                  setEditingListing(null);
                  setIsAddEditModalOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-amber-600/20 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ NEW LISTING</span>
              </button>
            )}

            {/* Role Navigation Buttons with Immersive Active Glow */}
            <nav className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setRole('buyer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  role === 'buyer'
                    ? 'bg-slate-800/80 text-amber-500 border border-amber-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {role === 'buyer' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                )}
                <span>Marketplace</span>
              </button>

              <button
                onClick={() => setRole('seller')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  role === 'seller'
                    ? 'bg-slate-800/80 text-amber-500 border border-amber-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {role === 'seller' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                )}
                <span>Seller Hub</span>
              </button>

              <button
                onClick={handleAdminClick}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  (role === 'admin' || role === 'owner') && isAdminAuthenticated
                    ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                }`}
                title={isAdminAuthenticated ? "Administrator Dashboard Active" : "Admin Hub (Password Protected)"}
              >
                {isAdminAuthenticated ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                )}
                <span>Admin Hub</span>
                {!isAdminAuthenticated && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-amber-400/80 font-mono">
                    🔒
                  </span>
                )}
              </button>
            </nav>

          </div>
        </div>
      </div>
    </header>
  );
};
