import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Car, 
  Store, 
  ShieldCheck, 
  PlusCircle, 
  GitCompare, 
  Terminal, 
  Search, 
  HelpCircle,
  CreditCard,
  Download,
  Lock,
  Globe,
  Share2,
  ChevronDown,
  MoreHorizontal,
  UserPlus,
  LogIn,
  X,
  Sparkles,
  QrCode,
  SlidersHorizontal,
  ExternalLink
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
    currentSeller, 
    setIsAddEditModalOpen, 
    setEditingListing,
    setIsRequestPartOpen,
    setIsInstallModalOpen,
    setIsSearchEngineModalOpen,
    openWebLinkGenerator,
    openSellerAuth,
    isAdminAuthenticated,
    setIsAdminAuthModalOpen,
    filters,
    setFilters
  } = useApp();

  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setRole('admin');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/90 shadow-xl shadow-black/40">
      
      {/* Dev App Alert Strip */}
      {isDevApp && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950/90 border-b border-amber-500/30 px-4 py-1 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="flex h-2 w-2 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-bold uppercase text-[10px] text-amber-400 tracking-wider flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                Dev Mode
              </span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                • Banking details & sandbox simulation unlocked in Admin Hub
              </span>
            </div>
            <button 
              onClick={() => setIsDevApp(!isDevApp)}
              className="text-[10px] px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-amber-300 font-mono transition-colors uppercase tracking-wider flex-shrink-0"
            >
              Dev: Active
            </button>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* LEFT: Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
            onClick={() => setRole('buyer')}
            title="Part Source ZA - Return to Marketplace"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg group-hover:border-amber-500/70 transition-all">
              <span className="font-black text-amber-500 text-xs sm:text-sm tracking-tighter">PS</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-amber-500 font-black text-base sm:text-lg tracking-tight whitespace-nowrap">
                  PART SOURCE <span className="text-white">ZA</span>
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
                  🇿🇦
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400 font-semibold hidden sm:block">
                Auto Spares Marketplace
              </p>
            </div>
          </div>

          {/* CENTER: Clean Segmented Navigation Tabs (Hidden on <md, moved to sub-bar for perfect fit) */}
          <nav className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 shadow-inner flex-shrink-0">
            
            {/* Tab 1: Marketplace */}
            <button
              onClick={() => setRole('buyer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                role === 'buyer'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>

            {/* Tab 2: Seller Hub */}
            <button
              onClick={() => setRole('seller')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                role === 'seller'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Seller Hub</span>
            </button>

            {/* Tab 3: Admin Hub */}
            <button
              onClick={handleAdminClick}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                role === 'admin' || role === 'owner'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={isAdminAuthenticated ? "Administrator Dashboard Active" : "Admin Hub (Password Protected)"}
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-950" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>Admin Hub</span>
              {!isAdminAuthenticated && (
                <span className="text-[8px] opacity-70">🔒</span>
              )}
            </button>
          </nav>

          {/* RIGHT: Actions, Search & Utility Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Quick Search Bar (Desktop) */}
            {role === 'buyer' && (
              <div className="hidden lg:block relative w-48 xl:w-60">
                <input
                  type="text"
                  placeholder="Search parts, OEM, make..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px]"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Mobile Search Toggle */}
            {role === 'buyer' && (
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80"
                title="Search spares"
              >
                <Search className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Compare Parts Button */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="relative px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Compare selected spares"
            >
              <GitCompare className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Compare</span>
              {compareList.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-black text-slate-950 bg-amber-400 rounded-full shadow-sm">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Quick Seller Actions: "+ Add Part" (Seller mode) or "Supplier Sign In" (Buyer mode) */}
            {role === 'seller' ? (
              <button
                onClick={() => {
                  setEditingListing(null);
                  setIsAddEditModalOpen(true);
                }}
                className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ ADD PART</span>
              </button>
            ) : (
              <button
                onClick={() => openSellerAuth('login')}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/15 text-amber-400 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 text-xs font-bold transition-all whitespace-nowrap"
                title="Scrap Yard & Auto Supplier Sign In or Registration"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Supplier Portal</span>
              </button>
            )}

            {/* Tools & SEO Dropdown Hub */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${
                  isToolsDropdownOpen 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/80'
                }`}
                title="Marketplace Tools, Web Link & SEO exposure"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Tools</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Tools Dropdown Menu */}
              {isToolsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      Platform Tools & Sharing
                    </span>
                    <span className="text-[11px] text-slate-400">
                      South Africa Nationwide Auto Network
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5">
                    
                    {/* Tool 1: Web Link & QR */}
                    <button
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        openWebLinkGenerator();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:text-white hover:bg-slate-800/90 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Share2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-amber-400">Web Link & QR Code</div>
                          <div className="text-[10px] text-slate-400">Share partssource.co.za links</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                        Link
                      </span>
                    </button>

                    {/* Tool 2: Google SEO & Indexing */}
                    <button
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        setIsSearchEngineModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:text-white hover:bg-slate-800/90 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400">Google SEO & Indexing</div>
                          <div className="text-[10px] text-slate-400">Search engine exposure hub</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                        Google
                      </span>
                    </button>

                    {/* Tool 3: Install App */}
                    <button
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        setIsInstallModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:text-white hover:bg-slate-800/90 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-emerald-400">Install App (PWA)</div>
                          <div className="text-[10px] text-slate-400">Mobile & desktop 1-click install</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        App
                      </span>
                    </button>

                    {/* Tool 4: Request Part (Buyer) */}
                    <button
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        setIsRequestPartOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:text-white hover:bg-slate-800/90 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-purple-400">Request Hard-to-Find Part</div>
                          <div className="text-[10px] text-slate-400">Broadcast to scrap yards</div>
                        </div>
                      </div>
                    </button>

                    {/* Tool 5: Supplier Portal Login & Registration */}
                    <button
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        openSellerAuth('login');
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:text-white hover:bg-slate-800/90 flex items-center justify-between group transition-colors border-t border-slate-800/80 mt-1 pt-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-amber-400">Supplier Login & Plans</div>
                          <div className="text-[10px] text-slate-400">Scrap yard portal & subscriptions</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        Plans
                      </span>
                    </button>

                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* MOBILE EXPANDABLE SEARCH BAR */}
      {isMobileSearchOpen && role === 'buyer' && (
        <div className="lg:hidden px-3 py-2.5 bg-slate-950 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="Search OEM, component, engine, vehicle model..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-9 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, search: '' }));
                setIsMobileSearchOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-white absolute right-2.5 top-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE DEDICATED SUB-BAR FOR TABS (Fits perfectly with 100% width distribution) */}
      <div className="md:hidden px-3 py-1.5 bg-slate-950/90 border-t border-slate-800/80">
        <nav className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800/80">
          
          <button
            onClick={() => setRole('buyer')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              role === 'buyer'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => setRole('seller')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              role === 'seller'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Seller Hub</span>
          </button>

          <button
            onClick={handleAdminClick}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
              role === 'admin' || role === 'owner'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAdminAuthenticated ? (
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <Lock className="w-3 h-3 flex-shrink-0" />
            )}
            <span>Admin Hub</span>
          </button>

        </nav>
      </div>

    </header>
  );
};
