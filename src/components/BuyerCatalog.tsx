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
  GitCompare, 
  SlidersHorizontal, 
  HelpCircle, 
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  Download,
  X,
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
  LocateFixed,
  AlertCircle,
  Loader2,
  CheckCircle,
  Share2,
  Calendar,
  Tag,
  Check,
  Award,
  ArrowRight,
  TrendingDown,
  Box,
  Sliders,
  Flame,
  CheckCheck,
  LayoutGrid,
  Grid,
  List
} from 'lucide-react';
import { Listing, VehicleType, PartCategory, SouthAfricanProvince, PartCondition } from '../types';
import { SA_PROVINCES, POPULAR_MAKES, POPULAR_MODELS_BY_MAKE, CATEGORIES } from '../data/mockData';
import { SA_PROVINCES_GEO, detectUserProvince, GeolocationResult } from '../utils/geolocation';

// Available model fitment years (current down to older platforms)
const FITMENT_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 
  2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2008, 2005, 2000
];

// Generation presets for quick year filtering
const YEAR_GENERATION_PRESETS = [
  { label: 'All Years', min: '', max: '', exact: '' },
  { label: '2021 – 2026 (Latest Gen)', min: 2021, max: 2026, exact: '' },
  { label: '2016 – 2020 (Facelift Gen)', min: 2016, max: 2020, exact: '' },
  { label: '2010 – 2015 (Mid Gen)', min: 2010, max: 2015, exact: '' },
  { label: 'Pre-2010 (Older Platforms)', min: 1995, max: 2009, exact: '' },
];

// Price presets with realistic South African automotive price brackets
const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under R3,000', min: '', max: 3000 },
  { label: 'R3,000 – R8,000', min: 3000, max: 8000 },
  { label: 'R8,000 – R20,000', min: 8000, max: 20000 },
  { label: 'R20,000 – R50,000', min: 20000, max: 50000 },
  { label: 'R50,000+', min: 50000, max: '' },
];

// Condition group presets
const CONDITION_GROUPS = [
  { id: '', label: 'All Conditions', icon: Box, description: 'New, Reconditioned & Scrap' },
  { id: 'new', label: '✨ Brand New Only', icon: Sparkles, description: 'OEM & High-Grade Aftermarket' },
  { id: 'reconditioned', label: '🔧 Reconditioned / Tested', icon: Wrench, description: 'Bench-Tested with Warranty' },
  { id: 'used', label: '♻️ Used / Scrap Stripping', icon: Shield, description: 'Original Dismantled Spares' },
];

const ALL_CONDITIONS_LIST: PartCondition[] = [
  'Brand New OEM',
  'Brand New Aftermarket',
  'Reconditioned / Tested',
  'Used Original (Clean)',
  'Scrap Stripping (Used)'
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
    setIsInstallModalOpen,
    openWhatsAppChat,
    openWebLinkGenerator
  } = useApp();

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [viewDensity, setViewDensity] = useState<'compact' | 'comfort' | 'list'>(() => {
    return (localStorage.getItem('partsource_catalog_density') as 'compact' | 'comfort' | 'list') || 'compact';
  });
  const [activeFilterTab, setActiveFilterTab] = useState<'fitment' | 'price' | 'condition'>('fitment');
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
      Object.values(POPULAR_MODELS_BY_MAKE).flat().slice(0, 20).forEach(m => modelsSet.add(m));
    }

    return Array.from(modelsSet);
  }, [filters.make, listings]);

  // Filtered model options for quick chips
  const filteredModelOptions = useMemo(() => {
    if (!modelSearchQuery) return availableModels;
    const q = modelSearchQuery.toLowerCase().trim();
    return availableModels.filter(m => m.toLowerCase().includes(q));
  }, [availableModels, modelSearchQuery]);

  // Filter listings based on user criteria (including advanced price, condition, make/model/year)
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

      // Exact Year Fitment Filter
      if (filters.year) {
        const selectedYear = Number(filters.year);
        if (!isNaN(selectedYear) && selectedYear > 0) {
          // Check if item's compatible year range spans the selected year
          if (item.yearStart > selectedYear || item.yearEnd < selectedYear) {
            return false;
          }
        }
      }

      // Year Range Filter (yearMin / yearMax)
      if (filters.yearMin !== '' && filters.yearMin !== undefined) {
        const minYear = Number(filters.yearMin);
        if (!isNaN(minYear) && item.yearEnd < minYear) {
          return false;
        }
      }
      if (filters.yearMax !== '' && filters.yearMax !== undefined) {
        const maxYear = Number(filters.yearMax);
        if (!isNaN(maxYear) && item.yearStart > maxYear) {
          return false;
        }
      }

      // Part Category
      if (filters.category && item.category !== filters.category) return false;

      // Province
      if (filters.province && item.locationProvince !== filters.province) return false;

      // High-level Condition Group Filter (New vs Used vs Reconditioned)
      if (filters.conditionGroup) {
        if (filters.conditionGroup === 'new') {
          if (item.condition !== 'Brand New OEM' && item.condition !== 'Brand New Aftermarket') {
            return false;
          }
        } else if (filters.conditionGroup === 'used') {
          if (item.condition !== 'Used Original (Clean)' && item.condition !== 'Scrap Stripping (Used)') {
            return false;
          }
        } else if (filters.conditionGroup === 'reconditioned') {
          if (item.condition !== 'Reconditioned / Tested') {
            return false;
          }
        }
      }

      // Specific Condition Filter
      if (filters.condition && item.condition !== filters.condition) return false;

      // Price Range Filter
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

  // Real-time condition counts
  const conditionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'newGroup': 0,
      'reconditionedGroup': 0,
      'usedGroup': 0,
    };
    ALL_CONDITIONS_LIST.forEach(c => counts[c] = 0);

    listings.forEach(item => {
      // apply other filters except condition
      if (filters.make && item.make.toLowerCase() !== filters.make.toLowerCase()) return;
      if (filters.model) {
        const m = filters.model.toLowerCase().trim();
        if (!item.model.toLowerCase().includes(m) && !item.title.toLowerCase().includes(m)) return;
      }
      if (filters.year && (item.yearStart > Number(filters.year) || item.yearEnd < Number(filters.year))) return;
      if (filters.category && item.category !== filters.category) return;
      if (filters.province && item.locationProvince !== filters.province) return;

      if (item.condition === 'Brand New OEM' || item.condition === 'Brand New Aftermarket') {
        counts['newGroup']++;
      } else if (item.condition === 'Reconditioned / Tested') {
        counts['reconditionedGroup']++;
      } else {
        counts['usedGroup']++;
      }

      if (counts[item.condition] !== undefined) {
        counts[item.condition]++;
      }
    });

    return counts;
  }, [listings, filters.make, filters.model, filters.year, filters.category, filters.province]);

  // Real-time price preset counts
  const pricePresetCounts = useMemo(() => {
    return PRICE_PRESETS.map(preset => {
      const count = listings.filter(item => {
        if (filters.make && item.make.toLowerCase() !== filters.make.toLowerCase()) return false;
        if (filters.model) {
          const m = filters.model.toLowerCase().trim();
          if (!item.model.toLowerCase().includes(m) && !item.title.toLowerCase().includes(m)) return false;
        }
        if (filters.year && (item.yearStart > Number(filters.year) || item.yearEnd < Number(filters.year))) return false;
        if (filters.category && item.category !== filters.category) return false;
        if (filters.province && item.locationProvince !== filters.province) return false;
        if (filters.condition && item.condition !== filters.condition) return false;
        
        if (preset.min !== '' && item.priceZAR < Number(preset.min)) return false;
        if (preset.max !== '' && item.priceZAR > Number(preset.max)) return false;
        return true;
      }).length;
      return { ...preset, count };
    });
  }, [listings, filters.make, filters.model, filters.year, filters.category, filters.province, filters.condition]);

  // Real-time category counts
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

  // Real-time province counts
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

  // Make counts
  const makeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    POPULAR_MAKES.forEach(m => {
      counts[m] = listings.filter(item => item.make.toLowerCase() === m.toLowerCase()).length;
    });
    return counts;
  }, [listings]);

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.year) count++;
    if (filters.yearMin !== '' && filters.yearMin !== undefined) count++;
    if (filters.yearMax !== '' && filters.yearMax !== undefined) count++;
    if (filters.vehicleType) count++;
    if (filters.category) count++;
    if (filters.province) count++;
    if (filters.condition) count++;
    if (filters.conditionGroup) count++;
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

  // Helper to check if a specific listing is an exact fit for the user's active vehicle selection
  const checkFitmentMatch = (listing: Listing) => {
    if (!filters.make && !filters.model && !filters.year) return false;
    
    let isMatch = true;
    if (filters.make && listing.make.toLowerCase() !== filters.make.toLowerCase()) isMatch = false;
    if (filters.model) {
      const m = filters.model.toLowerCase().trim();
      if (!listing.model.toLowerCase().includes(m) && !listing.title.toLowerCase().includes(m)) isMatch = false;
    }
    if (filters.year) {
      const y = Number(filters.year);
      if (listing.yearStart > y || listing.yearEnd < y) isMatch = false;
    }
    return isMatch;
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
                FIND SPARES BY <span className="text-amber-500">MAKE, MODEL, YEAR & PRICE</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Filter verified scrap yard stock, reconditioned engines, gearboxes, brand new OEM components and commercial truck parts with custom price and fitment controls.
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

          {/* Quick Vehicle Type Filter Pills */}
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
              
              {/* 1. Vehicle Make Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-amber-500" />
                    1. Vehicle Make
                  </span>
                  {filters.make && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, make: '', model: '' }))}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
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
                    className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer ${
                      filters.make ? 'border-amber-500/60 text-amber-300 bg-amber-500/5' : 'border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="">All Makes (Toyota, VW, Scania...)</option>
                    {POPULAR_MAKES.map(m => {
                      const count = makeCounts[m] || 0;
                      return (
                        <option key={m} value={m}>
                          {m} {count > 0 ? `(${count})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Car / Truck Model Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>2. Vehicle Model</span>
                  {filters.model && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, model: '' }))}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={filters.model}
                    onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                    className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer ${
                      filters.model ? 'border-amber-500/60 text-amber-300 bg-amber-500/5' : 'border-slate-800 text-slate-100'
                    }`}
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
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    3. Exact Model Year
                  </span>
                  {(filters.year || filters.yearMin || filters.yearMax) && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, year: '', yearMin: '', yearMax: '' }))}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value, yearMin: '', yearMax: '' }))}
                    className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer ${
                      filters.year ? 'border-amber-500/60 text-amber-300 bg-amber-500/5' : 'border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="">Any Year (All Model Years)</option>
                    {FITMENT_YEARS.map(y => (
                      <option key={y} value={y.toString()}>{y} Model Year</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 4. Part Category Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    4. Part Category
                  </span>
                  {filters.category && (
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all appearance-none cursor-pointer ${
                      filters.category ? 'border-amber-500/60 text-amber-300 bg-amber-500/5' : 'border-slate-800 text-slate-100'
                    }`}
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

            {/* Quick Condition Selector Tabs (All vs New vs Reconditioned vs Used) */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Condition:</span>
                <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  {CONDITION_GROUPS.map(group => {
                    const isSelected = filters.conditionGroup === group.id && !filters.condition;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          setFilters(prev => ({ 
                            ...prev, 
                            conditionGroup: group.id as any,
                            condition: '' // reset granular condition if switching group
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{group.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Summary Pill */}
              {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                <div className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-xl">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Price Filter: {filters.minPrice !== '' ? formatZAR(Number(filters.minPrice)) : 'R0'} – {filters.maxPrice !== '' ? formatZAR(Number(filters.maxPrice)) : 'Any'}
                  </span>
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Keyword Search Bar + Geolocation Province Selector + Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Search text input */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search part name, OEM code, engine spec (e.g. 1GD-FTV, 02T gearbox)..."
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

                {/* GPS Auto-Detect Button */}
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
                
                {/* Advanced Filter Suite Toggle Button */}
                <button
                  onClick={() => setIsAdvancedFiltersOpen(prev => !prev)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAdvancedFiltersOpen || filters.minPrice !== '' || filters.maxPrice !== '' || filters.condition || filters.conditionGroup || filters.yearMin || filters.yearMax || filters.verifiedOnly
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Advanced Filters</span>
                  {(filters.minPrice !== '' || filters.maxPrice !== '' || filters.condition || filters.conditionGroup || filters.yearMin || filters.yearMax) && (
                    <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                  )}
                  {isAdvancedFiltersOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                </button>

                {/* Share Search Link button */}
                <button
                  onClick={() => openWebLinkGenerator({
                    initialSearch: filters.search,
                    initialMake: filters.make,
                    initialModel: filters.model,
                    initialCategory: filters.category,
                    initialProvince: filters.province
                  })}
                  className="px-3.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-amber-500/40 shadow-sm group cursor-pointer"
                  title="Generate easy web search link & QR code"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                {/* Reset Filters button if any active */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                    title="Reset all search and filter criteria"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ({activeFilterCount})</span>
                  </button>
                )}

                {/* Broadcast part request */}
                <button
                  onClick={() => setIsRequestPartOpen(true)}
                  className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Request Part</span>
                </button>
              </div>

            </div>

            {/* Geolocation Feedback Banner */}
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
                  className="text-slate-400 hover:text-white shrink-0 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* ENHANCED ADVANCED FILTER DRAWER (Price, Condition, Fitment) */}
            {/* ======================================================== */}
            {isAdvancedFiltersOpen && (
              <div className="pt-4 mt-3 border-t border-slate-800 bg-slate-950/80 p-4 sm:p-5 rounded-2xl space-y-5 shadow-inner">
                
                {/* Advanced Filter Sub-Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setActiveFilterTab('fitment')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeFilterTab === 'fitment'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Vehicle Make / Model & Year</span>
                      {(filters.make || filters.model || filters.year || filters.yearMin || filters.yearMax) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveFilterTab('price')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeFilterTab === 'price'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Price Range (ZAR)</span>
                      {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveFilterTab('condition')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeFilterTab === 'condition'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Part Condition & Warranty</span>
                      {(filters.condition || filters.conditionGroup) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold hover:underline hidden sm:inline cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>

                {/* 1. VEHICLE FITMENT & MODEL YEAR TAB */}
                {activeFilterTab === 'fitment' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Make Quick Select Chips */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-amber-500" />
                          <span>Select Vehicle Manufacturer</span>
                        </label>
                        {filters.make && (
                          <span className="text-xs text-amber-400 font-semibold">Active: {filters.make}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_MAKES.map(m => {
                          const isSelected = filters.make.toLowerCase() === m.toLowerCase();
                          const count = makeCounts[m] || 0;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setFilters(prev => ({
                                  ...prev,
                                  make: isSelected ? '' : m,
                                  model: ''
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                              }`}
                            >
                              <span>{m}</span>
                              <span className={`text-[10px] px-1.5 rounded-full ${isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Model Quick Chips or Search */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-amber-500" />
                          <span>{filters.make ? `${filters.make} Models` : 'Popular Vehicle Models'}</span>
                        </label>
                        <div className="w-48">
                          <input
                            type="text"
                            placeholder="Filter model name..."
                            value={modelSearchQuery}
                            onChange={(e) => setModelSearchQuery(e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {filteredModelOptions.slice(0, 16).map(m => {
                          const isSelected = filters.model.toLowerCase() === m.toLowerCase();
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setFilters(prev => ({
                                  ...prev,
                                  model: isSelected ? '' : m
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                              }`}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Year Generation & Year Range Fitment Controls */}
                    <div className="pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>Vehicle Production Year & Generation Range</span>
                        </label>
                        {(filters.year || filters.yearMin || filters.yearMax) && (
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, year: '', yearMin: '', yearMax: '' }))}
                            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                          >
                            Clear Year Filters
                          </button>
                        )}
                      </div>

                      {/* Year Generation Presets */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {YEAR_GENERATION_PRESETS.map((preset, idx) => {
                          const isSelected = 
                            filters.yearMin === preset.min && 
                            filters.yearMax === preset.max && 
                            filters.year === preset.exact;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFilters(prev => ({
                                  ...prev,
                                  year: preset.exact,
                                  yearMin: preset.min,
                                  yearMax: preset.max
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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

                      {/* Custom Year From / To Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Exact Model Year:</span>
                          <select
                            value={filters.year}
                            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value, yearMin: '', yearMax: '' }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                          >
                            <option value="">Any Exact Year</option>
                            {FITMENT_YEARS.map(y => (
                              <option key={y} value={y.toString()}>{y}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">From Year (Min):</span>
                          <input
                            type="number"
                            placeholder="e.g. 2015"
                            min="1990"
                            max="2026"
                            value={filters.yearMin}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              year: '',
                              yearMin: e.target.value ? Number(e.target.value) : ''
                            }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">To Year (Max):</span>
                          <input
                            type="number"
                            placeholder="e.g. 2024"
                            min="1990"
                            max="2026"
                            value={filters.yearMax}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              year: '',
                              yearMax: e.target.value ? Number(e.target.value) : ''
                            }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. ADVANCED PRICE RANGE TAB */}
                {activeFilterTab === 'price' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                          <span>South African Rand (ZAR) Price Filters</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Prices include VAT where applicable. Direct scrap yard and dealer pricing.
                        </p>
                      </div>

                      {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-mono text-xs font-bold">
                            [{filters.minPrice !== '' ? formatZAR(Number(filters.minPrice)) : 'R0'} – {filters.maxPrice !== '' ? formatZAR(Number(filters.maxPrice)) : 'Unlimited'}]
                          </span>
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}
                            className="text-[11px] text-slate-400 hover:text-amber-400 underline cursor-pointer"
                          >
                            Clear Price
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Price Bracket Presets with Live Match Counts */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {pricePresetCounts.map((preset, idx) => {
                        const isSelected = 
                          filters.minPrice === preset.min && 
                          filters.maxPrice === preset.max;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFilters(prev => ({
                              ...prev,
                              minPrice: preset.min,
                              maxPrice: preset.max
                            }))}
                            className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between border ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                            }`}
                          >
                            <span className="text-xs font-bold block">{preset.label}</span>
                            <span className={`text-[10px] mt-1 font-mono ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                              {preset.count} {preset.count === 1 ? 'part' : 'parts'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Min / Max Price Inputs with Quick Increments */}
                    <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                          Minimum Price (ZAR):
                        </label>
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
                            className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          {[1000, 3000, 5000, 10000].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setFilters(prev => ({ ...prev, minPrice: val }))}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 cursor-pointer"
                            >
                              R{val >= 1000 ? `${val / 1000}k` : val}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                          Maximum Price (ZAR):
                        </label>
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
                            className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          {[15000, 30000, 50000, 100000].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setFilters(prev => ({ ...prev, maxPrice: val }))}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 cursor-pointer"
                            >
                              R{val >= 1000 ? `${val / 1000}k` : val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Sort Options by Price */}
                    <div className="pt-2 flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium">Sort Options:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFilters(prev => ({ ...prev, sortBy: 'price-asc' }))}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                            filters.sortBy === 'price-asc'
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          Lowest Price First
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilters(prev => ({ ...prev, sortBy: 'price-desc' }))}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                            filters.sortBy === 'price-desc'
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          Highest Price First
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. PART CONDITION & WARRANTY TAB */}
                {activeFilterTab === 'condition' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Box className="w-3.5 h-3.5 text-amber-500" />
                          <span>Part Condition (New vs. Used Dismantled)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Select brand new OEM replacement, bench-tested reconditioned units, or original scrap yard salvage.
                        </p>
                      </div>

                      {(filters.condition || filters.conditionGroup) && (
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, condition: '', conditionGroup: '' }))}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          Clear Condition
                        </button>
                      )}
                    </div>

                    {/* Condition Group Big Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {CONDITION_GROUPS.map(group => {
                        const Icon = group.icon;
                        const isSelected = filters.conditionGroup === group.id && !filters.condition;
                        const groupCount = 
                          group.id === 'new' ? conditionCounts['newGroup'] :
                          group.id === 'reconditioned' ? conditionCounts['reconditionedGroup'] :
                          group.id === 'used' ? conditionCounts['usedGroup'] :
                          listings.length;

                        return (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => {
                              setFilters(prev => ({
                                ...prev,
                                conditionGroup: group.id as any,
                                condition: ''
                              }));
                            }}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                                {groupCount} available
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-xs">{group.label}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{group.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Granular Condition Options */}
                    <div className="pt-3 border-t border-slate-800">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                        Granular Condition Grade:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {ALL_CONDITIONS_LIST.map(cond => {
                          const isSelected = filters.condition === cond;
                          const count = conditionCounts[cond] || 0;
                          return (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => {
                                setFilters(prev => ({
                                  ...prev,
                                  condition: isSelected ? '' : cond,
                                  conditionGroup: ''
                                }));
                              }}
                              className={`p-2.5 rounded-xl text-xs text-left transition-all border cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                              }`}
                            >
                              <span className="truncate mr-1">{cond}</span>
                              <span className={`text-[10px] font-mono shrink-0 px-1.5 rounded ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Trust and Supplier Filters */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={filters.verifiedOnly}
                          onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 w-3.5 h-3.5 cursor-pointer"
                        />
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Verified South African Suppliers Only</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={filters.inStockOnly}
                          onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900 w-3.5 h-3.5 cursor-pointer"
                        />
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>In-Stock Ready for Immediate Courier Dispatch</span>
                      </label>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* Quick Category Browser Pills / Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Browse Component Categories</span>
              </span>
              {filters.category && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
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
                    className="text-[11px] text-slate-400 hover:text-white hover:underline cursor-pointer"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
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
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install App (Mobile & Desktop)</span>
          </button>
        </div>

        {/* Exact Vehicle Fitment Match Indicator Banner */}
        {(filters.make || filters.model || filters.year) && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Vehicle Fitment Selected:
                  </span>
                  <span className="text-xs font-black text-amber-400">
                    {[filters.year ? `${filters.year}` : '', filters.make, filters.model].filter(Boolean).join(' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Filtering spare parts compatible with this specific vehicle configuration.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilters(prev => ({ ...prev, make: '', model: '', year: '', yearMin: '', yearMax: '' }))}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
            >
              Clear Vehicle Selection
            </button>
          </div>
        )}

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
                <button onClick={() => setFilters(prev => ({ ...prev, make: '', model: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Model Chip */}
            {filters.model && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Model: {filters.model}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, model: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Year Chip */}
            {filters.year && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Year: {filters.year}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, year: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Year Range Chip */}
            {(filters.yearMin || filters.yearMax) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Years: {filters.yearMin || 'Pre'} – {filters.yearMax || 'Current'}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, yearMin: '', yearMax: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Category Chip */}
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Category: {filters.category}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, category: '' }))} className="hover:text-white cursor-pointer">
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
                <button onClick={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Condition Group Chip */}
            {filters.conditionGroup && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span>Condition: {CONDITION_GROUPS.find(g => g.id === filters.conditionGroup)?.label || filters.conditionGroup}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, conditionGroup: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Granular Condition Chip */}
            {filters.condition && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>Grade: {filters.condition}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, condition: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Vehicle Type Chip */}
            {filters.vehicleType && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>Type: {filters.vehicleType}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, vehicleType: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Province Chip */}
            {filters.province && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>Province: {filters.province}</span>
                <button onClick={() => setFilters(prev => ({ ...prev, province: '' }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Verified Chip */}
            {filters.verifiedOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 text-xs font-semibold border border-emerald-800/50">
                <span>Verified Suppliers Only</span>
                <button onClick={() => setFilters(prev => ({ ...prev, verifiedOnly: false }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* In-Stock Chip */}
            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <span>In-Stock Only</span>
                <button onClick={() => setFilters(prev => ({ ...prev, inStockOnly: false }))} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear All Action */}
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
            >
              Clear All ({activeFilterCount})
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Sort By:</label>
              <select
                value={filters.sortBy}
                onChange={(e: any) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="newest">Newest Listed</option>
                <option value="price-asc">Price: Low to High (ZAR)</option>
                <option value="price-desc">Price: High to Low (ZAR)</option>
                <option value="rating">Top Supplier Rating</option>
              </select>
            </div>

            {/* View Density Switcher: Compact (Default) | Comfort | List */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => {
                  setViewDensity('compact');
                  localStorage.setItem('partsource_catalog_density', 'compact');
                }}
                className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                  viewDensity === 'compact'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Compact Grid (Smaller cards, more parts visible)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Compact</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewDensity('comfort');
                  localStorage.setItem('partsource_catalog_density', 'comfort');
                }}
                className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                  viewDensity === 'comfort'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Comfort Grid (Standard card view)"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Comfort</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewDensity('list');
                  localStorage.setItem('partsource_catalog_density', 'list');
                }}
                className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                  viewDensity === 'list'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="List View (Horizontal high-density rows)"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">List</span>
              </button>
            </div>

            {compareList.length > 0 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Matrix ({compareList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Listings Display */}
        {filteredListings.length > 0 ? (
          viewDensity === 'list' ? (
            /* High Density List View */
            <div className="flex flex-col gap-2.5 mt-5">
              {filteredListings.map(listing => {
                const inCompare = isInCompare(listing.id);
                const isExactFit = checkFitmentMatch(listing);
                const isNewCondition = listing.condition.includes('Brand New');
                const isReconditioned = listing.condition.includes('Reconditioned');

                return (
                  <div
                    key={listing.id}
                    className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3 shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div 
                        className="relative w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0 cursor-pointer"
                        onClick={() => setSelectedListing(listing)}
                      >
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {listing.isFeatured && (
                          <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[8px] font-black bg-amber-500 text-slate-950 uppercase">
                            ★
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="font-semibold text-amber-400">
                            {listing.make} {listing.model} ({listing.yearStart}-{listing.yearEnd})
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            isNewCondition
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : isReconditioned
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}>
                            {listing.condition}
                          </span>
                          {isExactFit && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Exact Fit
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => setSelectedListing(listing)}
                          className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer mt-0.5"
                        >
                          {listing.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="font-mono bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800 text-[9px]">
                            PN: {listing.partNumber}
                          </span>
                          <span className="text-slate-500">
                            {listing.warrantyMonths} Mo Warranty
                          </span>
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-amber-500" />
                            {listing.locationProvince}
                          </span>
                          <span className="text-slate-400 truncate">
                            by <strong className="text-slate-300">{listing.sellerName}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* List Row Right: Price and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-base sm:text-lg font-black text-white font-sans block">
                          {formatZAR(listing.priceZAR)}
                        </span>
                        <span className="text-[9px] text-slate-500 block">incl. VAT</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => inCompare ? removeFromCompare(listing.id) : addToCompare(listing)}
                          className={`p-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            inCompare 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                          title="Compare"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openWhatsAppChat(listing, 'availability')}
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-[10px] transition-colors"
                          title="WhatsApp Supplier"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => setSelectedListing(listing)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-amber-600/20"
                        >
                          Details / Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewDensity === 'compact' ? (
            /* Smaller, High-Density Compact Grid (Default) */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-3.5 mt-5">
              {filteredListings.map(listing => {
                const inCompare = isInCompare(listing.id);
                const isExactFit = checkFitmentMatch(listing);
                const isNewCondition = listing.condition.includes('Brand New');
                const isReconditioned = listing.condition.includes('Reconditioned');

                return (
                  <div
                    key={listing.id}
                    className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Compact Image & Badges */}
                      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setSelectedListing(listing)}>
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wide backdrop-blur-md border shadow-sm flex items-center gap-0.5 ${
                            isNewCondition
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                              : isReconditioned
                              ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                              : 'bg-slate-950/90 text-slate-300 border-slate-700'
                          }`}>
                            {isNewCondition ? <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> : isReconditioned ? <Wrench className="w-2.5 h-2.5 text-amber-400" /> : <Box className="w-2.5 h-2.5 text-slate-400" />}
                            <span>{listing.condition.replace('Brand New ', 'New ').replace('Reconditioned / Tested', 'Recon')}</span>
                          </span>

                          {listing.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wide flex items-center gap-0.5 shadow-sm">
                              <Sparkles className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}

                          {isExactFit && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wide flex items-center gap-0.5 shadow-sm animate-pulse">
                              <CheckCheck className="w-2.5 h-2.5" /> Exact Fit
                            </span>
                          )}
                        </div>

                        {/* Compact Bottom overlay */}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] sm:text-[9px] text-white font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                            <span>{listing.warrantyMonths}M War.</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded backdrop-blur-sm border flex items-center gap-0.5 truncate max-w-[50%] ${
                            filters.province && listing.locationProvince === filters.province
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-black/80 text-white border-white/10'
                          }`}>
                            <MapPin className={`w-2.5 h-2.5 shrink-0 ${filters.province && listing.locationProvince === filters.province ? 'text-slate-950' : 'text-amber-500'}`} />
                            <span className="truncate">{listing.locationProvince}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-2.5 sm:p-3">
                        {/* Fitment info */}
                        <div className="flex items-center gap-1 mb-1 text-[10px] sm:text-[11px] font-semibold text-amber-500 truncate">
                          <span className="truncate">{listing.make} {listing.model}</span>
                          <span className="text-slate-600 shrink-0">•</span>
                          <span className="text-slate-400 font-mono text-[10px] shrink-0">{listing.yearStart}-{listing.yearEnd}</span>
                        </div>

                        {/* Title */}
                        <h3 
                          onClick={() => setSelectedListing(listing)}
                          className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer mb-1 leading-snug"
                          title={listing.title}
                        >
                          {listing.title}
                        </h3>

                        {/* Part Number */}
                        <div className="flex items-center gap-1 mb-1.5 text-[9px] text-slate-400 font-mono truncate">
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                            PN: {listing.partNumber}
                          </span>
                          {listing.oemNumber && (
                            <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-500 shrink-0 truncate">
                              OEM: {listing.oemNumber}
                            </span>
                          )}
                        </div>

                        {/* Supplier Info */}
                        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] mb-1">
                          <span className="font-semibold text-slate-300 truncate max-w-[100px] sm:max-w-[120px]">
                            {listing.sellerName}
                          </span>
                          <span className="text-amber-500 font-bold shrink-0">
                            ★ {listing.sellerRating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Footer Actions */}
                    <div className="p-2.5 sm:p-3 pt-0">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-base sm:text-lg font-black text-white tracking-tight font-sans">
                          {formatZAR(listing.priceZAR)}
                        </span>
                        {listing.originalPriceZAR && (
                          <span className="text-[10px] text-slate-500 line-through font-mono">
                            {formatZAR(listing.originalPriceZAR)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => inCompare ? removeFromCompare(listing.id) : addToCompare(listing)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            inCompare 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                          }`}
                        >
                          <GitCompare className="w-3 h-3" />
                          <span>{inCompare ? 'Added' : 'Compare'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedListing(listing)}
                          className="py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-600/20 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Buy</span>
                        </button>
                      </div>

                      {/* WhatsApp Quick Direct Action */}
                      <div className="mt-1.5">
                        <button
                          type="button"
                          onClick={() => openWhatsAppChat(listing, 'availability')}
                          className="w-full py-1 px-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Comfort Grid (3-4 Columns with Standard Card Detail) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
              {filteredListings.map(listing => {
                const inCompare = isInCompare(listing.id);
                const isExactFit = checkFitmentMatch(listing);
                const isNewCondition = listing.condition.includes('Brand New');
                const isReconditioned = listing.condition.includes('Reconditioned');

                return (
                  <div
                    key={listing.id}
                    className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between"
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
                        
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-md flex items-center gap-1 ${
                            isNewCondition
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                              : isReconditioned
                              ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                              : 'bg-slate-950/90 text-slate-300 border-slate-700'
                          }`}>
                            {isNewCondition ? <Sparkles className="w-3 h-3 text-emerald-400" /> : isReconditioned ? <Wrench className="w-3 h-3 text-amber-400" /> : <Box className="w-3 h-3 text-slate-400" />}
                            <span>{listing.condition}</span>
                          </span>

                          {listing.isFeatured && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-md">
                              <Sparkles className="w-3 h-3" /> Featured
                            </span>
                          )}

                          {isExactFit && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                              <CheckCheck className="w-3 h-3" /> Exact Fit
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] text-white font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>{listing.warrantyMonths} Mo Warranty</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded backdrop-blur-sm border flex items-center gap-1 ${
                            filters.province && listing.locationProvince === filters.province
                              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                              : 'bg-black/80 text-white border-white/10'
                          }`}>
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span>{listing.locationProvince}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-amber-500">
                          <span>{listing.make}</span>
                          <span className="text-slate-700">•</span>
                          <span>{listing.model}</span>
                          <span className="text-slate-700">•</span>
                          <span className="text-slate-400 font-mono text-[10px]">{listing.yearStart}-{listing.yearEnd}</span>
                        </div>

                        <h3 
                          onClick={() => setSelectedListing(listing)}
                          className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer mb-2 leading-snug"
                        >
                          {listing.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[10px] text-slate-400 font-mono">
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            PN: {listing.partNumber}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300 truncate max-w-[140px]">
                            {listing.sellerName}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            ★ {listing.sellerRating}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Footer Actions */}
                    <div className="p-3.5 sm:p-4 pt-0">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-xl font-black text-white tracking-tight font-sans">
                          {formatZAR(listing.priceZAR)}
                        </span>
                        {listing.originalPriceZAR && (
                          <span className="text-xs text-slate-500 line-through font-mono">
                            {formatZAR(listing.originalPriceZAR)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => inCompare ? removeFromCompare(listing.id) : addToCompare(listing)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            inCompare 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                          }`}
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>{inCompare ? 'In Matrix' : 'Compare'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedListing(listing)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-600/20 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details / Buy</span>
                        </button>
                      </div>

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
          )
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
                : 'We couldn’t find an exact match for your selected make, model, year, condition, or price range. Try clearing specific filters or broadcast an instant rare part request to our nationwide network of South African auto dismantlers.'}
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
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-amber-500/20 whitespace-nowrap cursor-pointer"
          >
            Open Matrix
          </button>
        </div>
      )}

    </div>
  );
};
