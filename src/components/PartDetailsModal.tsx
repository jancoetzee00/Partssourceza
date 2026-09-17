import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SouthAfricanProvince } from '../types';
import { SA_PROVINCES } from '../data/mockData';
import { SA_PROVINCES_GEO } from '../utils/geolocation';
import { estimateDeliveryCost } from '../utils/deliveryEstimator';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  Phone, 
  Mail, 
  GitCompare, 
  Check, 
  Truck, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Share2, 
  Tag, 
  Cpu, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Compass,
  Clock,
  Zap,
  Store,
  ArrowRight
} from 'lucide-react';

export const PartDetailsModal: React.FC = () => {
  const { 
    selectedListing, 
    setSelectedListing, 
    addToCompare, 
    removeFromCompare, 
    isInCompare, 
    createInquiry,
    setIsCheckoutOpen,
    openWhatsAppChat,
    openWebLinkGenerator,
    showNotification,
    filters
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Delivery destination province state (defaults to buyer's active filter or seller's province)
  const [deliveryProvince, setDeliveryProvince] = useState<SouthAfricanProvince>(() => {
    if (filters?.province && filters.province in SA_PROVINCES_GEO) {
      return filters.province as SouthAfricanProvince;
    }
    return (selectedListing?.locationProvince as SouthAfricanProvince) || 'Gauteng';
  });

  // Selected delivery speed/method: standard road courier, express overnight, or counter collection
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express' | 'collection'>('standard');

  // Sync destination province when selectedListing changes
  useEffect(() => {
    if (filters?.province && filters.province in SA_PROVINCES_GEO) {
      setDeliveryProvince(filters.province as SouthAfricanProvince);
    } else if (selectedListing?.locationProvince && selectedListing.locationProvince in SA_PROVINCES_GEO) {
      setDeliveryProvince(selectedListing.locationProvince as SouthAfricanProvince);
    }
  }, [selectedListing?.id, filters?.province]);

  if (!selectedListing) return null;

  const inCompare = isInCompare(selectedListing.id);

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate live delivery estimate from seller location to selected destination province
  const deliveryEstimate = useMemo(() => {
    return estimateDeliveryCost(
      selectedListing.locationProvince,
      deliveryProvince,
      selectedListing.deliveryCostZAR,
      selectedListing.category
    );
  }, [selectedListing.locationProvince, selectedListing.deliveryCostZAR, selectedListing.category, deliveryProvince]);

  // Express air/road multiplier cost calculation
  const expressCostZAR = useMemo(() => {
    return Math.max(220, Math.round((deliveryEstimate.estimatedCostZAR * 1.35 + 80) / 10) * 10);
  }, [deliveryEstimate.estimatedCostZAR]);

  // Effective delivery cost based on chosen method
  const effectiveDeliveryFee = useMemo(() => {
    if (deliveryOption === 'collection') return 0;
    if (deliveryOption === 'express') return expressCostZAR;
    return deliveryEstimate.estimatedCostZAR;
  }, [deliveryOption, expressCostZAR, deliveryEstimate.estimatedCostZAR]);

  // Total landed price including selected delivery method
  const totalLandedPrice = selectedListing.priceZAR + effectiveDeliveryFee;

  const deliveryOptionLabel = deliveryOption === 'collection'
    ? 'Counter Collection (Free R0)'
    : `${deliveryOption === 'express' ? 'Express Priority Courier' : 'Standard Road Freight'} to ${deliveryProvince} (Est. ${formatZAR(effectiveDeliveryFee)})`;

  const waMessage = encodeURIComponent(
    `Hello ${selectedListing.sellerName},\nI am inquiring about the following part on Part Source ZA:\n\n*${selectedListing.title}*\nPart No: ${selectedListing.partNumber}\nPrice: ${formatZAR(selectedListing.priceZAR)}\nSeller Location: ${selectedListing.locationCity}, ${selectedListing.locationProvince}\nDelivery to: ${deliveryProvince} via ${deliveryOptionLabel}\nTotal Landed: ${formatZAR(totalLandedPrice)}\n\nIs this unit currently in stock and available for courier or collection?`
  );
  const rawWa = selectedListing.sellerWhatsApp || selectedListing.sellerPhone || '27824591029';
  const cleanWa = (rawWa || '').replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanWa}?text=${waMessage}`;

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone || !inquiryMessage) {
      showNotification('Missing Information', 'Please provide your name, phone number and message.', 'warning');
      return;
    }
    setIsSubmittingInquiry(true);
    createInquiry({
      listingId: selectedListing.id,
      partTitle: selectedListing.title,
      sellerId: selectedListing.sellerId,
      sellerName: selectedListing.sellerName,
      buyerName: inquiryName,
      buyerPhone: inquiryPhone,
      buyerEmail: inquiryEmail || 'Not specified',
      message: `${inquiryMessage}\n[Selected Delivery: ${deliveryOptionLabel} | Landed Total: ${formatZAR(totalLandedPrice)}]`
    });
    setIsSubmittingInquiry(false);
    setInquirySubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header bar */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/90">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider shrink-0 whitespace-nowrap">
              {selectedListing.vehicleType.toUpperCase()}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono truncate hidden xs:inline">
              Ref: {selectedListing.id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => openWebLinkGenerator({
                initialPartId: selectedListing.id,
                initialMake: selectedListing.make,
                initialModel: selectedListing.model,
                initialCategory: selectedListing.category,
                initialProvince: selectedListing.locationProvince
              })}
              className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shrink-0 whitespace-nowrap cursor-pointer"
              title="Share deep-link & QR code for this part"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={() => inCompare ? removeFromCompare(selectedListing.id) : addToCompare(selectedListing)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
                inCompare ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{inCompare ? 'In Matrix' : 'Compare'}</span>
            </button>
            <button
              onClick={() => setSelectedListing(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Gallery & Specs (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Main Image */}
              <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={selectedListing.images[activeImageIndex] || selectedListing.images[0]}
                  alt={selectedListing.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                
                {selectedListing.images.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : selectedListing.images.length - 1))}
                      className="p-2 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex(prev => (prev < selectedListing.images.length - 1 ? prev + 1 : 0))}
                      className="p-2 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs text-white border border-white/10">
                  {selectedListing.condition}
                </div>
              </div>

              {/* Thumbnails */}
              {selectedListing.images.length > 1 && (
                <div className="flex gap-2">
                  {selectedListing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-16 w-20 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-amber-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Technical Fitment Table */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  Vehicle Compatibility & Specifications
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Manufacturer / Make</span>
                    <span className="font-bold text-white text-sm">{selectedListing.make}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Model Application</span>
                    <span className="font-bold text-white text-sm">{selectedListing.model}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Compatible Year Range</span>
                    <span className="font-mono font-bold text-amber-400">{selectedListing.yearStart} - {selectedListing.yearEnd}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Category</span>
                    <span className="font-medium text-slate-200">{selectedListing.category}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Part Number</span>
                    <span className="font-mono font-bold text-slate-200">{selectedListing.partNumber}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">OEM Reference</span>
                    <span className="font-mono font-bold text-slate-200">{selectedListing.oemNumber || 'Direct OEM Match'}</span>
                  </div>
                </div>

                {selectedListing.engineSpec && (
                  <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                    <span className="font-bold block text-amber-400">Engine / Drivetrain Spec:</span>
                    {selectedListing.engineSpec}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Supplier Item Description
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {selectedListing.description}
                </p>
              </div>

            </div>

            {/* Right: Pricing, Supplier & Action Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Title and Price Box */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight mb-3">
                  {selectedListing.title}
                </h2>

                <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-slate-700">
                  <div>
                    <span className="text-xs text-slate-400 block">Direct Supplier Price</span>
                    <span className="text-3xl font-black text-amber-400 font-sans">
                      {formatZAR(selectedListing.priceZAR)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold block">
                      In Stock ({selectedListing.stockCount} left)
                    </span>
                  </div>
                </div>

                {/* Purchase & Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Purchase Online • {formatZAR(totalLandedPrice)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsAppChat(selectedListing, 'availability')}
                    className="w-full py-2.5 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                    <span className="truncate">Direct WhatsApp Supplier ({selectedListing.sellerWhatsApp})</span>
                  </button>

                  <a
                    href={`tel:${selectedListing.sellerPhone}`}
                    className="w-full py-2 px-3 sm:px-4 bg-slate-900 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Call Supplier ({selectedListing.sellerPhone})</span>
                  </a>
                </div>

                {/* Trust and Delivery Guarantees */}
                <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>{selectedListing.warrantyMonths} Months</strong> replacement / return warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>
                      {deliveryOption === 'collection'
                        ? 'Counter collection at yard (FREE)'
                        : `${deliveryOption === 'express' ? '1 - 2 Days' : deliveryEstimate.deliveryDays} (${formatZAR(effectiveDeliveryFee)} to ${deliveryProvince})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Yard location: {selectedListing.locationCity}, {selectedListing.locationProvince}</span>
                  </div>
                </div>

              </div>

              {/* Delivery Cost & Transit Estimator UI Field */}
              <div 
                id="part-delivery-estimator-card"
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4"
              >
                {/* Estimator Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        Delivery Cost Estimator
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Dispatched from <span className="text-slate-200 font-semibold">{selectedListing.locationCity}, {selectedListing.locationProvince}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 border border-slate-700 block">
                      ~{deliveryEstimate.distanceKm} km route
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">
                      {deliveryEstimate.routeTier === 'local' ? 'Intra-Provincial' : 'Inter-Provincial'}
                    </span>
                  </div>
                </div>

                {/* Province Selector: Fast Pills + Dropdown */}
                <div className="space-y-2">
                  <label 
                    htmlFor="delivery-destination-province" 
                    className="text-xs font-bold text-slate-200 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      Select Destination Province:
                    </span>
                    {deliveryProvince === selectedListing.locationProvince ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Same Province (Local)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        9 SA Provinces
                      </span>
                    )}
                  </label>

                  {/* Fast Selection Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {(['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State'] as SouthAfricanProvince[]).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setDeliveryProvince(prov)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          deliveryProvince === prov
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-slate-900/90 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
                        }`}
                      >
                        {prov}
                        {prov === selectedListing.locationProvince ? ' (Yard)' : ''}
                      </button>
                    ))}
                  </div>

                  {/* Comprehensive Dropdown */}
                  <div className="relative pt-1">
                    <select
                      id="delivery-destination-province"
                      value={deliveryProvince}
                      onChange={(e) => setDeliveryProvince(e.target.value as SouthAfricanProvince)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium cursor-pointer"
                    >
                      {SA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov} {prov === selectedListing.locationProvince ? '— Seller Yard Location' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery Method Options: Standard, Express, Counter Collection */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Choose Shipping / Collection Method:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Standard Courier */}
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('standard')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        deliveryOption === 'standard'
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-amber-400" />
                            Standard
                          </span>
                          {deliveryOption === 'standard' && (
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {deliveryEstimate.deliveryDays}
                        </span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-700/50">
                        <span className="text-xs font-black text-amber-400 font-sans">
                          {formatZAR(deliveryEstimate.estimatedCostZAR)}
                        </span>
                      </div>
                    </button>

                    {/* Express Priority */}
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('express')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        deliveryOption === 'express'
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            Express
                          </span>
                          {deliveryOption === 'express' && (
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          1 - 2 Business Days
                        </span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-700/50">
                        <span className="text-xs font-black text-amber-400 font-sans">
                          {formatZAR(expressCostZAR)}
                        </span>
                      </div>
                    </button>

                    {/* Counter Collection */}
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('collection')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        deliveryOption === 'collection'
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-emerald-400" />
                            Collect
                          </span>
                          {deliveryOption === 'collection' && (
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Same Day (Yard)
                        </span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-700/50">
                        <span className="text-xs font-black text-emerald-400 font-sans">
                          FREE (R0)
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Total Landed Cost Summary Box */}
                <div className="p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Component Price:</span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {formatZAR(selectedListing.priceZAR)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Estimated Shipping ({deliveryProvince}):
                    </span>
                    <span className="font-semibold text-amber-400 font-mono">
                      {deliveryOption === 'collection' ? 'FREE (R0)' : formatZAR(effectiveDeliveryFee)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Total Landed Estimate:
                      </span>
                      <span className="text-xl font-black text-amber-400 font-sans">
                        {formatZAR(totalLandedPrice)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(true)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                    {deliveryOption === 'collection' 
                      ? `Pick up in person at ${selectedListing.locationCity}, ${selectedListing.locationProvince}. No shipping fee applies.`
                      : deliveryEstimate.breakdownNotice}
                  </p>
                </div>
              </div>

              {/* Supplier Profile Card */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                      {selectedListing.sellerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        {selectedListing.sellerName}
                        {selectedListing.sellerVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400">Verified South African Auto Dismantler</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    ★ {selectedListing.sellerRating}
                  </span>
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Send Direct Message to Supplier
                </h4>
                
                {inquirySubmitted ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-600/40 rounded-xl text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-emerald-200">Inquiry Sent to {selectedListing.sellerName}</p>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">The supplier will contact your phone or WhatsApp shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-2 text-xs">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        placeholder="Phone / WhatsApp"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        placeholder={`e.g. Is this compatible with my vehicle? Can you ship to ${deliveryProvince}?`}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg text-xs transition-colors border border-amber-500/30"
                    >
                      {isSubmittingInquiry ? 'Sending...' : 'Submit Inquiry'}
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
