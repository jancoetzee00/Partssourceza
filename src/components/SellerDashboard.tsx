import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Package, 
  Eye, 
  MessageCircle, 
  Phone, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Store, 
  Search, 
  ArrowUpRight,
  RefreshCw,
  Clock,
  Layers,
  FileText, 
  Download,
  FileSpreadsheet,
  UploadCloud,
  Sliders,
  Share2,
  QrCode,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { Listing } from '../types';

export const SellerDashboard: React.FC = () => {
  const { 
    currentSeller, 
    setCurrentSellerId, 
    sellers, 
    listings, 
    deleteListing, 
    setIsAddEditModalOpen, 
    setIsBulkUploadModalOpen,
    openWebLinkGenerator,
    setEditingListing, 
    setIsSubscriptionModalOpen,
    setIsInstallModalOpen,
    inquiries,
    orders,
    setSelectedListing,
    updateListing
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries' | 'orders' | 'subscription'>('listings');

  // Filter listings for current seller
  const sellerListings = listings.filter(l => l.sellerId === currentSeller.id);
  const filteredListings = sellerListings.filter(l => 
    l.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.partNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.make.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Inquiries for current seller
  const sellerInquiries = inquiries.filter(i => i.sellerId === currentSeller.id);
  // Orders for current seller
  const sellerOrders = orders.filter(o => o.sellerId === currentSeller.id);

  // Subscription plan details
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === currentSeller.subscriptionTier) || SUBSCRIPTION_PLANS[0];
  const listingUsagePercent = Math.min(100, Math.round((sellerListings.length / currentPlan.listingLimit) * 100));

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Seller Header & Profile Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500 font-black text-lg shadow-lg">
                {currentSeller.businessName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentSeller.businessName}
                  </h1>
                  {currentSeller.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reg: {currentSeller.registrationNumber} • {currentSeller.city}, {currentSeller.province} • Contact: {currentSeller.contactPerson} ({currentSeller.phone})
                </p>
              </div>
            </div>

            {/* Switch active seller simulation selector */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Switch Supplier Account:</span>
                <select
                  value={currentSeller.id}
                  onChange={(e) => setCurrentSellerId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.businessName} ({s.subscriptionTier.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Install Part Source ZA on Phone or Desktop"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>

              <button
                onClick={() => openWebLinkGenerator({
                  initialProvince: currentSeller.province,
                  initialPartId: ''
                })}
                className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                title="Generate Web Link & QR Code for Part Source ZA search & physical store"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Web Link & QR</span>
              </button>

              <button
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                title="Bulk Upload or Export Spares via CSV/Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Bulk CSV / Excel</span>
              </button>

              <button
                onClick={() => {
                  setEditingListing(null);
                  setIsAddEditModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ ADD PART</span>
              </button>
            </div>

          </div>

          {/* Metric KPIs matching Immersive UI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            
            {/* Active Listings */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                Active Listings
                <Package className="w-4 h-4 text-amber-500" />
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-light text-white font-mono">{sellerListings.length}</span>
                <span className="text-xs text-slate-500">/ {currentPlan.listingLimit} cap</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.8)]" 
                  style={{ width: `${listingUsagePercent}%` }}
                ></div>
              </div>
            </div>

            {/* Total Views */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                Catalog Views
                <Eye className="w-4 h-4 text-blue-400" />
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-light text-white font-mono">
                  {sellerListings.reduce((acc, curr) => acc + curr.views, 0)}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center">+18% wk</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Verified buyer impressions</p>
            </div>

            {/* Inquiries / Leads */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl hover:border-slate-700/80 transition-all">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                Buyer Leads
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-light text-white font-mono">
                  {sellerInquiries.length + sellerListings.reduce((acc, curr) => acc + curr.inquiriesCount, 0)}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">Active Leads</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">WhatsApp & Web requests</p>
            </div>

            {/* Monthly Subscription Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  Monthly Plan
                </span>
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                  {currentSeller.subscriptionTier}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-light text-white font-mono">
                  R{currentPlan.priceMonthlyZAR}<span className="text-xs font-normal text-slate-400">/mo</span>
                </span>
                <button
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline uppercase tracking-wider"
                >
                  Manage
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Renews: <span className="text-slate-200 font-mono">{currentSeller.subscriptionRenewsAt}</span>
              </p>
            </div>

          </div>

          {/* Sub-navigation tabs with Immersive Styling */}
          <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'listings' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              My Spares Inventory ({sellerListings.length})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'inquiries' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              Buyer Inquiries ({sellerInquiries.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              Confirmed Orders ({sellerOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'subscription' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              Subscription & Bank Billing
            </button>
          </div>

        </div>
      </div>

      {/* Tab 1: Listings Inventory Management (Create, Edit, Delete) */}
      {activeTab === 'listings' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* Inventory Top Filter & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by part title, OEM SKU, vehicle make..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-full text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>Bulk CSV/Excel Tools</span>
              </button>

              <button
                onClick={() => {
                  setEditingListing(null);
                  setIsAddEditModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ LIST NEW AUTO PART</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Inventory Table (2 Columns on large screen) */}
            <div className="lg:col-span-2">
              {filteredListings.length > 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/20">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                      Active Inventory & Spares ({filteredListings.length})
                    </h3>
                    <span className="text-[10px] text-amber-500 font-mono">
                      {currentSeller.businessName}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Component & Application</th>
                          <th className="py-3 px-4">Part / OEM SKU</th>
                          <th className="py-3 px-4">Price (ZAR)</th>
                          <th className="py-3 px-4">Warranty</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {filteredListings.map(item => (
                          <tr key={item.id} className="hover:bg-slate-800/40 border-b border-slate-800 transition-colors">
                            
                            {/* Part Title & Image */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 bg-slate-800 rounded-lg object-cover border border-slate-700 flex-shrink-0 cursor-pointer"
                                  onClick={() => setSelectedListing(item)}
                                />
                                <div>
                                  <span 
                                    onClick={() => setSelectedListing(item)}
                                    className="font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer block"
                                  >
                                    {item.title}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                    <span>{item.make} {item.model}</span>
                                    <span>•</span>
                                    <span className="font-mono">{item.yearStart}-{item.yearEnd}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* SKU */}
                            <td className="py-3 px-4 font-mono text-slate-300">
                              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                                {item.partNumber}
                              </span>
                              {item.oemNumber && (
                                <div className="text-[9px] text-slate-500 mt-0.5">OEM: {item.oemNumber}</div>
                              )}
                            </td>

                            {/* Price */}
                            <td className="py-3 px-4 font-bold text-white font-sans text-xs">
                              {formatZAR(item.priceZAR)}
                            </td>

                            {/* Warranty & Stock */}
                            <td className="py-3 px-4">
                              <span className="text-emerald-400 font-semibold text-[11px] block">{item.warrantyMonths} Mo</span>
                              <span className="text-[10px] text-slate-500">{item.stockCount} in stock</span>
                            </td>

                            {/* Edit & Delete Action Buttons */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openWebLinkGenerator({
                                    initialPartId: item.id,
                                    initialMake: item.make,
                                    initialModel: item.model,
                                    initialCategory: item.category,
                                    initialProvince: currentSeller.province
                                  })}
                                  className="text-amber-400 hover:text-amber-300 font-semibold text-xs px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1"
                                  title="Generate shareable web link and QR code for this specific part"
                                >
                                  <Share2 className="w-3 h-3 text-amber-400" />
                                  <span>Link/QR</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingListing(item);
                                    setIsAddEditModalOpen(true);
                                  }}
                                  className="text-slate-300 hover:text-white font-semibold text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                                  title="Edit listing details"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                                      deleteListing(item.id);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 font-semibold text-xs px-2 py-1 rounded hover:bg-red-950/40 transition-colors"
                                  title="Delete listing"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl px-4">
                  <div className="h-16 w-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-3">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">No spares listed in catalog yet</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-6 max-w-md mx-auto">
                    Start listing your scrap yard or auto shop parts individually, or upload your entire spreadsheet inventory in seconds using our bulk CSV/Excel manager.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setIsBulkUploadModalOpen(true)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Bulk Upload CSV / Excel File</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingListing(null);
                        setIsAddEditModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors"
                    >
                      + Add Single Part Manually
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Side Analytics & Market Comparison (Right Column) */}
            <div className="space-y-6">
              
              {/* Market Comparison Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Market Price Benchmark
                  </h3>
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Live ZAR Average
                  </span>
                </div>

                <div className="flex items-end gap-1.5 h-24 pt-4 border-b border-slate-800 pb-2">
                  <div className="flex-1 bg-slate-800 rounded-t h-[45%] hover:bg-slate-700 transition-all cursor-pointer" title="Jun Avg: R3,400"></div>
                  <div className="flex-1 bg-slate-800 rounded-t h-[60%] hover:bg-slate-700 transition-all cursor-pointer" title="Jul Avg: R4,200"></div>
                  <div className="flex-1 bg-slate-800 rounded-t h-[40%] hover:bg-slate-700 transition-all cursor-pointer" title="Aug Avg: R3,100"></div>
                  <div className="flex-1 bg-slate-800 rounded-t h-[75%] hover:bg-slate-700 transition-all cursor-pointer" title="Sep Avg: R5,600"></div>
                  <div className="flex-1 bg-slate-800 rounded-t h-[55%] hover:bg-slate-700 transition-all cursor-pointer" title="Oct Avg: R3,900"></div>
                  <div className="flex-1 bg-amber-500 rounded-t h-[90%] shadow-[0_0_8px_rgba(245,158,11,0.6)] cursor-pointer" title="Current Your Avg: R6,850"></div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 uppercase mt-2">
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span className="text-amber-400 font-bold">Now</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Your Average Listing</span>
                    <span className="font-mono font-bold text-white">R4,850</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">National Scrap Average</span>
                    <span className="font-mono text-slate-400">R4,120</span>
                  </div>
                </div>
              </div>

              {/* Financial Invoicing Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/30 p-5 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    Subscription Invoicing
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">PAID</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Monthly advertising billed to <strong className="text-white">{currentSeller.businessName}</strong> under account ref <span className="font-mono text-amber-400">PS-{currentSeller.id.toUpperCase()}</span>.
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                  >
                    View Official EFT Details
                  </button>
                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Manage Plan
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Buyer Inquiries & WhatsApp Leads */}
      {activeTab === 'inquiries' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* Header Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5 fill-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Direct WhatsApp Lead & Inquiry Hub</h3>
                <p className="text-xs text-slate-400">
                  Real-time automotive inquiries from car owners, fleet workshops, and mechanics across South Africa.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/20">
                WhatsApp: {currentSeller.whatsapp}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {sellerInquiries.length > 0 ? (
              sellerInquiries.map(inq => {
                const buyerCleanWa = inq.buyerPhone.replace(/[^0-9]/g, '');
                const formattedBuyerWa = buyerCleanWa.startsWith('0') ? '27' + buyerCleanWa.slice(1) : buyerCleanWa;

                const replyStockMessage = encodeURIComponent(
                  `👋 Hello ${inq.buyerName}, this is ${currentSeller.businessName} regarding your inquiry on *${inq.partTitle}* via Part Source ZA.\n\n✅ *Status:* Yes! This exact unit is currently in stock at our ${currentSeller.city} yard.\n\nWould you like us to send photos/video or book courier dispatch to your location?`
                );

                const replyPhotosMessage = encodeURIComponent(
                  `👋 Hi ${inq.buyerName}, here are the requested condition photos and test details for *${inq.partTitle}* from ${currentSeller.businessName}.\n\nPlease review and let us know if you need VIN verification or courier freight arranged.`
                );

                const replyCourierMessage = encodeURIComponent(
                  `🚚 Hello ${inq.buyerName}, regarding delivery for *${inq.partTitle}*:\nWe dispatch daily across South Africa via The Courier Guy. Courier turnaround is typically 24-48 hours. Please reply with your delivery address to confirm.`
                );

                return (
                  <div key={inq.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 font-mono">{inq.id}</span>
                        {inq.channel === 'whatsapp' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 fill-emerald-300" />
                            WhatsApp Direct Lead
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            Web Form Inquiry
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-white">
                          {inq.partTitle}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(inq.createdAt).toLocaleDateString('en-ZA', { dateStyle: 'medium' })} • {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-xl text-xs text-slate-200 border border-slate-800 leading-relaxed font-sans">
                      <p className="text-slate-300 font-medium whitespace-pre-wrap">{inq.message}</p>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs pt-1">
                      <div className="text-slate-300">
                        <span className="font-bold text-white">{inq.buyerName}</span> • Phone: <span className="font-mono text-emerald-400 font-semibold">{inq.buyerPhone}</span> • Email: {inq.buyerEmail}
                      </div>

                      {/* Quick WhatsApp Reply Presets */}
                      <div className="flex flex-wrap items-center gap-2">
                        
                        {/* Quick preset 1: Stock confirmed */}
                        <a
                          href={`https://wa.me/${formattedBuyerWa}?text=${replyStockMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Reply: In Stock & Ready"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>"In Stock" Reply</span>
                        </a>

                        {/* Quick preset 2: Send photos */}
                        <a
                          href={`https://wa.me/${formattedBuyerWa}?text=${replyPhotosMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Reply: Send Photos/Video"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>"Send Photos" Reply</span>
                        </a>

                        {/* General Open WhatsApp */}
                        <a
                          href={`https://wa.me/${formattedBuyerWa}?text=Hello%20${encodeURIComponent(inq.buyerName)},%20this%20is%20${encodeURIComponent(currentSeller.businessName)}%20regarding%20${encodeURIComponent(inq.partTitle)}...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>Open WhatsApp Chat</span>
                        </a>

                        <a
                          href={`tel:${inq.buyerPhone}`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Call Buyer</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
                <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No incoming buyer inquiries</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inquiries and WhatsApp leads submitted by buyers for your parts will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Confirmed Orders */}
      {activeTab === 'orders' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="space-y-4">
            {sellerOrders.length > 0 ? (
              sellerOrders.map(ord => (
                <div key={ord.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 font-mono">{ord.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {ord.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {ord.partTitle} (SKU: {ord.partNumber})
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-white font-sans">
                        {formatZAR(ord.totalAmountZAR)}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {ord.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Buyer & Delivery Address</span>
                      <span className="font-semibold text-white">{ord.buyerName}</span> ({ord.buyerPhone})
                      <p className="text-slate-400 mt-0.5">{ord.deliveryAddress}, {ord.province}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Delivery Notes & Breakdown</span>
                      <p className="text-slate-300">{ord.notes || 'Standard courier dispatch'}</p>
                      <p className="text-[11px] text-amber-400 mt-1">Courier Fee: {formatZAR(ord.deliveryFeeZAR)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`https://wa.me/${ord.buyerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(ord.buyerName)},%20this%20is%20${encodeURIComponent(currentSeller.businessName)}%20regarding%20Order%20${ord.id}...`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contact Buyer</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No orders yet</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Confirmed online orders will appear here for courier fulfillment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Subscription & Billing Overview */}
      {activeTab === 'subscription' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider">
                  Active Monthly Subscription
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  {currentPlan.name} (R{currentPlan.priceMonthlyZAR}/month)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your monthly advertising subscription keeps your scrapyard and spares inventory visible to thousands of mechanics, fleet operators, and car owners nationwide.
                </p>
              </div>

              <button
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/25 whitespace-nowrap"
              >
                Change or Renew Plan
              </button>
            </div>

            {/* Plan Perks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {SUBSCRIPTION_PLANS.map(plan => {
                const isCurrent = plan.id === currentSeller.subscriptionTier;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40'
                        : 'bg-slate-950 border-slate-800 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-black text-amber-400 mb-3 font-sans">
                        R{plan.priceMonthlyZAR}<span className="text-xs text-slate-400 font-normal"> / month</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {plan.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setIsSubscriptionModalOpen(true)}
                      className={`mt-5 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      {isCurrent ? 'Billing Details' : `Switch to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
