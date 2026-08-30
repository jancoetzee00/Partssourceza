import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  Car, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  Phone, 
  GitCompare, 
  Check, 
  SlidersHorizontal, 
  HelpCircle, 
  ArrowUpDown, 
  Sparkles,
  Tag,
  Clock,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  Download,
  Smartphone,
  Monitor,
  X,
  Calendar,
  DollarSign,
  Layers,
  Wrench,
  Cpu,
  Disc,
  Zap,
  ThermometerSnowflake,
  SunMedium,
  Gauge,
  Shield,
  GitPullRequest,
  CircleDot,
  Droplets,
  Navigation,
  LocateFixed,
  Compass,
  Building2,
  AlertCircle,
  Loader2,
  CheckCircle,
  Share2,
  Globe,
  Link as LinkIcon,
  QrCode
} from 'lucide-react';
import { Listing, VehicleType, PartCategory, SouthAfricanProvince, PartCondition } from '../types';
import { SA_PROVINCES, POPULAR_MAKES, POPULAR_MODELS_BY_MAKE, CATEGORIES } from '../data/mockData';
import { SA_PROVINCES_GEO, detectUserProvince, GeolocationResult } from '../utils/geolocation';

// Available model fitment years (current down to older platforms)
const FITMENT_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 
  2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2008, 2005
];

// Price presets for quick selection
const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under R3,000', min: '', max: 3000 },
  { label: 'R3,000 – R10,000', min: 3000, max: 10000 },
  { label: 'R10,000 – R25,000', min: 10000, max: 25000 },
  { label: 'R25,000 – R50,000', min: 25000, max: 50000 },
  { label: 'R50,000+', min: 50000, max: '' },
];

export const BuyerCatalog: React.FC = () => {
  const { 
    listings, 
    filters, 
    setFilters, 
    resetFilters, 
    setSelectedListing, 
    addToCompare, 
    removeFromCompare, 
    isInCompare,
    compareList,
    setIsCompareOpen,
    setIsRequestPartOpen,
    setIsCheckoutOpen,
    setIsInstallModalOpen,
    openWhatsAppChat,
    openWebLinkGenerator
  } = useApp();

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string; details?: string } | null>(null);

  // Trigger GPS Geolocation to detect user's South African province
  const handleDetectLocation = async () => {
    setIsLocating(true);
    setGeoFeedback(null);
    try {
      const result: GeolocationResult = await detectUserProvince();
      setIsLocating(false);
      if (result.success && result.province) {
        setFilters(prev => ({ ...prev, province: result.province! }));
        const geoInfo = SA_PROVINCES_GEO[result.province];
        setGeoFeedback({
          type: 'success',
          message: `Location detected: ${result.province}${result.city ? ` (${result.city})` : ''}`,
          details: geoInfo ? geoInfo.tagline : `Showing parts available in ${result.province}`
        });
      } else {
        setGeoFeedback({
          type: 'error',
          message: result.error || 'Could not detect your exact location.',
          details: 'Please select your South African province manually from the list below.'
        });
      }
    } catch (err: any) {
      setIsLocating(false);
      setGeoFeedback({
        type: 'error',
        message: 'Location access timed out or was denied.',
        details: 'You can still choose any of South Africa\'s 9 provinces manually.'
      });
    }
  };

  // Available models dynamically computed based on selected make or across all listings
  const availableModels = useMemo(() => {
    const modelsSet = new Set<string>();

    if (filters.make) {
      // Add predefined popular models for this make
      const popular = POPULAR_MODELS_BY_MAKE[filters.make] || [];
      popular.forEach(m => modelsSet.add(m));

      // Add any distinct models currently in listings for this make
      listings
        .filter(item => item.make.toLowerCase() === filters.make.toLowerCase())
        .forEach(item => modelsSet.add(item.model));
    } else {
      // Add all distinct models from all listings
      listings.forEach(item => modelsSet.add(item.model));
      
      // Also add top popular models across makes
      Object.values(POPULAR_MODELS_BY_MAKE).flat().slice(0, 15).forEach(m => modelsSet.add(m));
    }

    return Array.from(modelsSet);
  }, [filters.make, listings]);

  // Filter listings based on user criteria
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Keyword Search
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const matchesSearch = 
          item.title.toLowerCase().includes(query) ||
          item.partNumber.toLowerCase().includes(query) ||
          (item.oemNumber && item.oemNumber.toLowerCase().includes(query)) ||
          item.make.toLowerCase().includes(query) ||
          item.model.toLowerCase().includes(query) ||
          (item.engineSpec && item.engineSpec.toLowerCase().includes(query)) ||
          item.category.toLowerCase().includes(query) ||
          item.sellerName.toLowerCase().includes(query) ||
          item.locationCity.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Vehicle Type
      if (filters.vehicleType && item.vehicleType !== filters.vehicleType) return false;

      // Make
      if (filters.make && item.make.toLowerCase() !== filters.make.toLowerCase()) return false;

      // Car / Truck Model
      if (filters.model) {
        const filterModelLower = filters.model.toLowerCase().trim();
        const itemModelLower = item.model.toLowerCase();
        // Match exact or substring in model or title
        const matchesModel = 
          itemModelLower.includes(filterModelLower) || 
          filterModelLower.includes(itemModelLower) ||
          item.title.toLowerCase().includes(filterModelLower);
        if (!matchesModel) return false;
      }

      // Year Filter
      if (filters.year) {
        const selectedYear = Number(filters.year);
        if (!isNaN(selectedYear)) {
          // Check if item's compatible year range spans the selected year
          if (item.yearStart > selectedYear || item.yearEnd < selectedYear) {
            return false;
          }
        }
      }

      // Part Category
      if (filters.category && item.category !== filters.category) return false;

      // Province
      if (filters.province && item.locationProvince !== filters.province) return false;

      // Condition
      if (filters.condition && item.condition !== filters.condition) return false;

      // Price Range
      if (filters.minPrice !== '' && item.priceZAR < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== '' && item.priceZAR > Number(filters.maxPrice)) return false;

      // Verified only
      if (filters.verifiedOnly && !item.sellerVerified) return false;

      // In stock
      if (filters.inStockOnly && item.stockCount <= 0) return false;

      // Featured only
      if (filters.featuredOnly && !item.isFeatured) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.priceZAR - b.priceZAR;
      if (filters.sortBy === 'price-desc') return b.priceZAR - a.priceZAR;
      if (filters.sortBy === 'rating') return b.sellerRating - a.sellerRating;
      // newest default
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });
  }, [listings, filters]);

  // Real-time category counts based on current other filters
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(c => {
      counts[c.name] = listings.filter(item => {
        if (filters.make && item.make.toLowerCase() !== filters.make.toLowerCase()) return false;
        if (filters.vehicleType && item.vehicleType !== filters.vehicleType) return false;
        if (filters.year && (item.yearStart > Number(filters.year) || item.yearEnd < Number(filters.year))) return false;
        return item.category === c.name;
      }).length;
    });
    return counts;
  }, [listings, filters.make, filters.vehicleType, filters.year]);

  // Real-time province counts based on search query, make, model & category
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SA_PROVINCES.forEach(p => {
      counts[p] = listings.filter(item => {
        if (filters.search) {
          const query = filters.search.toLowerCase().trim();
          const matchesSearch = 
            item.title.toLowerCase().includes(query) ||
            item.partNumber.toLowerCase().includes(query) ||
            (item.oemNumber && item.oemNumber.toLowerCase().includes(query)) ||
            item.make.toLowerCase().includes(query) ||
            item.model.toLowerCase().includes(query) ||
            item.locationCity.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }
        if (filters.make && item.make.toLowerCase() !== filters.make.toLowerCase()) return false;
        if (filters.model) {
          const m = filters.model.toLowerCase().trim();
          if (!item.model.toLowerCase().includes(m) && !item.title.toLowerCase().includes(m)) return false;
        }
        if (filters.vehicleType && item.vehicleType !== filters.vehicleType) return false;
        if (filters.category && item.category !== filters.category) return false;
        return item.locationProvince === p;
      }).length;
    });
    return counts;
  }, [listings, filters.search, filters.make, filters.model, filters.vehicleType, filters.category]);

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.year) count++;
    if (filters.vehicleType) count++;
    if (filters.category) count++;
    if (filters.province) count++;
    if (filters.condition) count++;
    if (filters.minPrice !== '' || filters.maxPrice !== '') count++;
    if (filters.verifiedOnly) count++;
    if (filters.inStockOnly) count++;
    if (filters.featuredOnly) count++;
    return count;
  }, [filters]);

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper to get Category icon component
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Engine & Mechanical': return Cpu;
      case 'Gearbox & Drivetrain': return GitPullRequest;
      case 'Brakes & Hubs': return Disc;
      case 'Suspension & Steering': return SlidersHorizontal;
      case 'Body Panels & Bumpers': return Shield;
      case 'Auto Electrical & ECUs': return Zap;
      case 'Cooling & Radiators': return ThermometerSnowflake;
      case 'Lighting & Mirrors': return SunMedium;
      case 'Turbochargers & Fuel': return Gauge;
      case 'Truck Heavy Duty Axles': return Truck;
      case 'Tires & Wheels': return CircleDot;
      case 'Hydraulic Systems': return Droplets;
      default: return Wrench;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Hero Vehicle Search & Advanced Filter Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800/80 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Title & Live Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-7">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]"></div>
                <span>South Africa’s Verified Spares Hub</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                FIND SPARES BY <span className="text-amber-500">MAKE, MODEL, YEAR & CATEGORY</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Filter verified scrap yard stock, engines, gearboxes, and OEM commercial truck axles across all 9 provinces with direct price comparison.
              </p>
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xl">
              <div className="text-center px-3">
                <p className="text-2xl font-light text-amber-500 font-mono">{listings.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spares Listed</p>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-center px-3">
                <p className="text-2xl font-light text-white font-mono">{filteredListings.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Matches</p>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-center px-3">
                <p className="text-2xl font-light text-emerald-400 font-mono">0%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Buyer Fee</p>
              </div>
            </div>
          </div>

          {/* Vehicle Type Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: 'All Vehicles', value: '' },
              { label: '🚗 Cars & Hatchbacks', value: 'car' },
              { label: '🛻 Bakkies & 4x4s', value: 'bakkie' },
              { label: '🚛 Heavy Duty Trucks', value: 'truck' },
              { label: '🚐 Commercial & Minibuses', value: 'commercial' },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setFilters(prev => ({ ...prev, vehicleType: type.value }))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filters.vehicleType === type.value
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Primary Advanced Filter Control Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
            
            {/* Main 4-Column Selectors: Make, Model, Year, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* 1. Make selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>1. Vehicle Make</span>
                  {filters.make && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, make: '', model: '' }))}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={filters.make}
                    onChange={(e) => {
                      const newMake = e.target.value;
                      setFilters(prev => ({ ...prev, make: newMake, model: '' }));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Makes (Toyota, VW, Scania...)</option>
                    {POPULAR_MAKES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Car / Truck Model selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>2. Car / Truck Model</span>
                  {filters.model && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, model: '' }))}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={filters.model}
                    onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">
                      {filters.make ? `All ${filters.make} Models` : 'All Models (Hilux, Polo, Actros...)'}
                    </option>
                    {availableModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 3. Year Fitment Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>3. Year of Manufacture</span>
                  {filters.year && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, year: '' }))}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Any Year (All Model Years)</option>
                    {FITMENT_YEARS.map(y => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 4. Part Category Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>4. Part Category</span>
                  {filters.category && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Categories (Engine, Gearbox...)</option>
                    {CATEGORIES.map(c => {
                      const count = categoryCounts[c.name] ?? 0;
                      return (
                        <option key={c.name} value={c.name}>
                          {c.name} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Keyword Search Bar + Geolocation Province Selector + Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Search text input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Part name, OEM code, engine spec (e.g. 1GD-FTV, caliper)..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Geolocation Province Quick Dropdown & GPS Auto-Locate Trigger */}
              <div className="flex items-center gap-2">
                
                {/* Province Dropdown */}
                <div className="relative min-w-[170px] sm:min-w-[190px]">
                  <select
                    value={filters.province}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, province: e.target.value }));
                      setGeoFeedback(null);
                    }}
                    className={`w-full pl-8 pr-7 py-2.5 bg-slate-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer ${
                      filters.province
                        ? 'border-amber-500/60 text-amber-300 bg-amber-500/5'
                        : 'border-slate-800 text-slate-300'
                    }`}
                  >
                    <option value="">🇿🇦 All 9 Provinces</option>
                    {SA_PROVINCES.map(p => {
                      const count = provinceCounts[p] ?? 0;
                      return (
                        <option key={p} value={p}>
                          📍 {p} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <MapPin className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${filters.province ? 'text-amber-400' : 'text-slate-500'}`} />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* GPS Auto-Detect Button with Radar Pulse Effect */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm ${
                    isLocating
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : filters.province
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                  }`}
                  title="Detect your South African province via GPS"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span className="hidden sm:inline">Locating...</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">GPS Locate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons: Advanced toggle, Reset, Request */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                
                {/* Advanced Filter Toggle Button */}
                <button
                  onClick={() => setIsAdvancedFiltersOpen(prev => !prev)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isAdvancedFiltersOpen || filters.minPrice !== '' || filters.maxPrice !== '' || filters.condition || filters.verifiedOnly
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">More Filters</span>
                  {(filters.minPrice !== '' || filters.maxPrice !== '' || filters.condition || filters.verifiedOnly || filters.inStockOnly) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                  {isAdvancedFiltersOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                </button>

                {/* Share Search Link & Web Visibility button */}
                <button
                  onClick={() => openWebLinkGenerator({
                    initialSearch: filters.search,
                    initialMake: filters.make,
                    initialModel: filters.model,
                    initialCategory: filters.category,
                    initialProvince: filters.province
                  })}
                  className="px-3.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-500/40 shadow-sm group"
                  title="Generate easy web search link & QR code (partssource.co.za)"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Share Search Link</span>
                  <span className="sm:hidden">Share</span>
                </button>

                {/* Reset Filters button if any active */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="Reset all search and filter criteria"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ({activeFilterCount})</span>
                  </button>
                )}

                {/* Broadcast part request */}
                <button
                  onClick={() => setIsRequestPartOpen(true)}
                  className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Request</span>
                </button>
              </div>

            </div>

            {/* Geolocation Feedback Banner (if detected or error) */}
            {geoFeedback && (
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
                geoFeedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}>
                <div className="flex items-center gap-2">
                  {geoFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold mr-1.5">{geoFeedback.message}</span>
                    {geoFeedback.details && <span className="opacity-90 text-[11px]">{geoFeedback.details}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => setGeoFeedback(null)}
                  className="text-slate-400 hover:text-white shrink-0 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Expandable Advanced Filters Drawer / Section (Price Range, Province, Condition, Toggles) */}
            {isAdvancedFiltersOpen && (
              <div className="pt-4 mt-2 border-t border-slate-800 bg-slate-950/60 p-4 rounded-xl space-y-4">
                
                {/* Price Range Controls Header */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                      <span>Price Range (ZAR incl. VAT)</span>
                      {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                        <span className="text-amber-400 font-mono font-normal ml-2">
                          [{filters.minPrice !== '' ? formatZAR(Number(filters.minPrice)) : 'R0'} — {filters.maxPrice !== '' ? formatZAR(Number(filters.maxPrice)) : 'Any'}]
                        </span>
                      )}
                    </label>

                    {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}
                        className="text-[11px] text-slate-400 hover:text-amber-400 underline self-start sm:self-auto"
                      >
                        Clear Price Filter
                      </button>
                    )}
                  </div>

                  {/* Price Tier Preset Buttons */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PRICE_PRESETS.map((preset, idx) => {
                      const isSelected = 
                        filters.minPrice === preset.min && 
                        filters.maxPrice === preset.max;
                      return (
                        <button
                          key={idx}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            minPrice: preset.min,
                            maxPrice: preset.max
                          }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Min / Max Price Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Minimum Price (R):</span>
                      <div className="relative">
                        <span className="text-xs text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono">R</span>
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="500"
                          value={filters.minPrice}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            minPrice: e.target.value ? Number(e.target.value) : ''
                          }))}
                          className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Maximum Price (R):</span>
                      <div className="relative">
                        <span className="text-xs text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono">R</span>
                        <input
                          type="number"
                          placeholder="e.g. 50000"
                          min="0"
                          step="1000"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            maxPrice: e.target.value ? Number(e.target.value) : ''
                          }))}
                          className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Filters: Province, Condition, Quality Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-slate-800">
                  
                  {/* Province selector with GPS Locate integration */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Province / Scrap Yard Location
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <LocateFixed className="w-3 h-3" />
                        <span>{isLocating ? 'Detecting...' : 'Detect GPS'}</span>
                      </button>
                    </div>
                    <select
                      value={filters.province}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, province: e.target.value }));
                        setGeoFeedback(null);
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="">🇿🇦 All 9 Provinces (Nationwide)</option>
                      {SA_PROVINCES.map(p => {
                        const count = provinceCounts[p] ?? 0;
                        return (
                          <option key={p} value={p}>
                            {p} ({count} spares available)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Condition selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Part Condition / Grade
                    </label>
                    <select
                      value={filters.condition}
                      onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">Any Condition</option>
                      <option value="Brand New OEM">Brand New OEM</option>
                      <option value="Brand New Aftermarket">Brand New Aftermarket</option>
                      <option value="Reconditioned / Tested">Reconditioned / Tested</option>
                      <option value="Used Original (Clean)">Used Original (Clean)</option>
                    </select>
                  </div>

                  {/* Trust & Quality Toggles */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Supplier & Stock Filters
                    </label>
                    <div className="flex flex-col gap-2 pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={filters.verifiedOnly}
                          onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 w-3.5 h-3.5"
                        />
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified Suppliers Only</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={filters.inStockOnly}
                          onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 w-3.5 h-3.5"
                        />
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>In-Stock Ready for Dispatch</span>
                      </label>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* Quick Category Browser Pills / Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Browse by Component Category</span>
              </span>
              {filters.category && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Show All Categories
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map(category => {
                const IconComponent = getCategoryIcon(category.name);
                const isSelected = filters.category === category.name;
                const count = categoryCounts[category.name] ?? 0;

                return (
                  <button
                    key={category.name}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      category: isSelected ? '' : category.name
                    }))}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span>{category.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick South African Province Geolocation Fast-Switcher Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Search by Province & Scrap Yard Hub</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <LocateFixed className="w-3 h-3" />
                  <span>{isLocating ? 'Detecting Location...' : 'Auto-Detect via GPS'}</span>
                </button>
                {filters.province && (
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, province: '' }));
                      setGeoFeedback(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white hover:underline"
                  >
                    View All South Africa
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {/* All South Africa Chip */}
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, province: '' }));
                  setGeoFeedback(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                  !filters.province
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>🇿🇦 All South Africa</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  !filters.province ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {listings.length}
                </span>
              </button>

              {/* 9 Provinces Chips */}
              {SA_PROVINCES.map(province => {
                const isSelected = filters.province === province;
                const count = provinceCounts[province] ?? 0;

                return (
                  <button
                    key={province}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        province: isSelected ? '' : province
                      }));
                      setGeoFeedback(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <MapPin className={`w-3 h-3 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span>{province}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Province Hub Banner */}
          {filters.province && (
            <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Showing Scrap Yards & Spares in {filters.province}
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      {filteredListings.length} {filteredListings.length === 1 ? 'part' : 'parts'} found
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {SA_PROVINCES_GEO[filters.province as SouthAfricanProvince]?.tagline || 'Verified suppliers & scrap yards'} · Hubs: {SA_PROVINCES_GEO[filters.province as SouthAfricanProvince]?.majorHubs?.join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, province: '' }));
                  setGeoFeedback(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px] whitespace-nowrap self-end sm:self-auto cursor-pointer"
              >
                Clear Location (Search Nationwide)
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Main Catalog Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Universal App Install Quick Banner */}
        <div className="mb-6 bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Get Part Source ZA on Mobile & Desktop
                </h3>
                <span className="px-2 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950 uppercase tracking-widest">
                  Official App
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Instant scrap yard WhatsApp alerts, offline spares search, and 1-tap quote comparisons.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Install App (Mobile & Desktop)</span>
          </button>
        </div>

        {/* Active Filters Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="mb-6 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-500" />
              Active Filters:
            </span>

            {/* Make Chip */}
            {filters.make && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Make: {filters.make}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, make: '', model: '' }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Model Chip */}
            {filters.model && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Model: {filters.model}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, model: '' }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Year Chip */}
            {filters.year && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Year: {filters.year}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, year: '' }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Category Chip */}
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Category: {filters.category}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, category: '' }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Price Range Chip */}
            {(filters.minPrice !== '' || filters.maxPrice !== '') && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>
                  Price: {filters.minPrice !== '' ? formatZAR(Number(filters.minPrice)) : 'R0'} – {filters.maxPrice !== '' ? formatZAR(Number(filters.maxPrice)) : 'Any'}
                </span>
                <button onClick={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Vehicle Type Chip */}
            {filters.vehicleType && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>Type: {filters.vehicleType}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, vehicleType: '' }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Province Chip */}
            {filters.province && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>Province: {filters.province}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, province: '' }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Condition Chip */}
            {filters.condition && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>Condition: {filters.condition}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, condition: '' }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Verified Chip */}
            {filters.verifiedOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 text-xs font-semibold border border-emerald-800/50">
                <span>Verified Suppliers Only</span>
                <button onClick={() => setFilters(prev => ({ ...prev, verifiedOnly: false }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* In-Stock Chip */}
            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>In-Stock Only</span>
                <button onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear All Action */}
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Results Bar & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Available Spares & Components
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold border border-slate-700">
                {filteredListings.length} {filteredListings.length === 1 ? 'part' : 'parts'} found
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct South African supplier pricing with verified warranties & nationwide freight
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Sort By:</label>
              <select
                value={filters.sortBy}
                onChange={(e: any) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="newest">Newest Listed</option>
                <option value="price-asc">Price: Low to High (ZAR)</option>
                <option value="price-desc">Price: High to Low (ZAR)</option>
                <option value="rating">Top Supplier Rating</option>
              </select>
            </div>

            {compareList.length > 0 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Matrix ({compareList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredListings.map(listing => {
              const inCompare = isInCompare(listing.id);
              const waMessage = encodeURIComponent(
                `Hi ${listing.sellerName}, I found your listing "${listing.title}" (Ref: ${listing.partNumber}) for ${formatZAR(listing.priceZAR)} on Part Source ZA. Is this still available?`
              );
              const waLink = `https://wa.me/${listing.sellerWhatsApp.replace(/[^0-9]/g, '')}?text=${waMessage}`;

              return (
                <div
                  key={listing.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-2xl transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setSelectedListing(listing)}>
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Condition badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/90 text-white backdrop-blur-md border border-slate-700 shadow-md">
                          {listing.condition}
                        </span>
                        {listing.isFeatured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>

                      {/* Stock & Warranty Pill */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white font-mono">
                        <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10">
                          {listing.warrantyMonths} Mo Warranty
                        </span>
                        <span className={`px-2 py-0.5 rounded backdrop-blur-sm border flex items-center gap-1 ${
                          filters.province && listing.locationProvince === filters.province
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                            : 'bg-black/80 text-white border-white/10'
                        }`}>
                          <MapPin className={`w-3 h-3 ${filters.province && listing.locationProvince === filters.province ? 'text-slate-950' : 'text-amber-500'}`} />
                          <span>
                            {listing.locationCity ? `${listing.locationCity}, ` : ''}{listing.locationProvince}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      
                      {/* Fitment info */}
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-500">
                        <span>{listing.make}</span>
                        <span className="text-slate-700">•</span>
                        <span>{listing.model}</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-slate-400 font-mono">{listing.yearStart}-{listing.yearEnd}</span>
                      </div>

                      {/* Title */}
                      <h3 
                        onClick={() => setSelectedListing(listing)}
                        className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer mb-2 leading-snug"
                      >
                        {listing.title}
                      </h3>

                      {/* Part Number & OEM */}
                      <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] text-slate-400 font-mono">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          PN: {listing.partNumber}
                        </span>
                        {listing.oemNumber && (
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-500">
                            OEM: {listing.oemNumber}
                          </span>
                        )}
                      </div>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {listing.description}
                      </p>

                      {/* Supplier Badge */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-300 truncate max-w-[170px]">
                            {listing.sellerName}
                          </span>
                          {listing.sellerVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" title="Verified South African Supplier" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          ★ {listing.sellerRating}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Pricing & Footer Actions */}
                  <div className="p-4 sm:p-5 pt-0">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Price (incl. VAT)</span>
                        <span className="text-2xl font-black text-white tracking-tight font-sans">
                          {formatZAR(listing.priceZAR)}
                        </span>
                      </div>
                      {listing.originalPriceZAR && (
                        <span className="text-xs text-slate-500 line-through font-mono">
                          {formatZAR(listing.originalPriceZAR)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Compare toggle */}
                      <button
                        onClick={() => inCompare ? removeFromCompare(listing.id) : addToCompare(listing)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          inCompare 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                        }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>{inCompare ? 'Comparing' : 'Compare'}</span>
                      </button>

                      {/* View & Purchase */}
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-600/20"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details / Buy</span>
                      </button>
                    </div>

                    {/* WhatsApp Quick Direct Action */}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => openWhatsAppChat(listing, 'availability')}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                        <span>Direct WhatsApp Supplier</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State with Actionable Guidance */
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center my-12 max-w-2xl mx-auto">
            <Car className="w-12 h-12 text-amber-400 mx-auto mb-4 stroke-1" />
            <h3 className="text-xl font-bold text-white mb-2">
              {filters.province
                ? `No matching spares found in ${filters.province}`
                : 'No matching car or truck parts found'}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {filters.province
                ? `There are currently no listings in ${filters.province} matching your exact filters. You can expand your search to all 9 South African provinces (many scrap yards offer nationwide courier delivery) or broadcast a direct part request.`
                : 'We couldn’t find an exact match for your selected make, model, year, category, or price range. Try clearing specific filters or broadcast an instant rare part request to our nationwide network of South African auto dismantlers.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {filters.province && (
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, province: '' }));
                    setGeoFeedback(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Search All 9 Provinces Nationwide</span>
                </button>
              )}
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
              <button
                onClick={() => setIsRequestPartOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Broadcast Part Request to Suppliers</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Floating Compare Matrix Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900 border border-amber-500/50 shadow-2xl shadow-black/80 rounded-2xl px-5 py-3.5 flex items-center gap-4 max-w-xl w-full mx-4 backdrop-blur-lg">
          <div className="flex -space-x-3 overflow-hidden">
            {compareList.map(item => (
              <img
                key={item.id}
                src={item.images[0]}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-900 object-cover"
              />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {compareList.length} part{compareList.length > 1 ? 's' : ''} in comparison tray
            </p>
            <p className="text-[11px] text-slate-400">
              Side-by-side fitment, price & warranty check
            </p>
          </div>
          <button
            onClick={() => setIsCompareOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
          >
            Open Matrix
          </button>
        </div>
      )}

    </div>
  );
};

