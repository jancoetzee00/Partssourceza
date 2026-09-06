import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SouthAfricanProvince } from '../types';
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
  Clock
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

  const waMessage = encodeURIComponent(
    `Hello ${selectedListing.sellerName},\nI am inquiring about the following part on Part Source ZA:\n\n*${selectedListing.title}*\nPart No: ${selectedListing.partNumber}\nPrice: ${formatZAR(selectedListing.priceZAR)}\nSeller Location: ${selectedListing.locationCity}, ${selectedListing.locationProvince}\nDelivery to: ${deliveryProvince} (Est. ${formatZAR(deliveryEstimate.estimatedCostZAR)})\n\nIs this unit currently in stock and available for courier or collection?`
  );
  const waLink = `https://wa.me/${selectedListing.sellerWhatsApp.replace(/[^0-9]/g, '')}?text=${waMessage}`;

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
      message: `${inquiryMessage}\n[Preferred Delivery Province: ${deliveryProvince} | Est. Freight: ${formatZAR(deliveryEstimate.estimatedCostZAR)}]`
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
                    <span>Purchase Component Online</span>
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
                      {deliveryEstimate.deliveryDays} (<strong>{formatZAR(deliveryEstimate.estimatedCostZAR)}</strong> to {deliveryProvince})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Collection available at {selectedListing.locationCity}, {selectedListing.locationProvince}</span>
                  </div>
                </div>

              </div>

              {/* Delivery Cost & Transit Estimator UI Field */}
              <div 
                id="part-delivery-estimator-card"
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        Estimate Delivery to Your Province
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Dispatched from {selectedListing.locationCity}, {selectedListing.locationProvince}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-700">
                    SA Logistics
                  </span>
                </div>

                {/* Province Selector Field */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="delivery-destination-province" 
                    className="text-[11px] font-semibold text-slate-300 flex items-center justify-between"
                  >
                    <span>Destination Province:</span>
                    {deliveryProvince === selectedListing.locationProvince && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Same Province (Local Pickup)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="delivery-destination-province"
                      value={deliveryProvince}
                      onChange={(e) => setDeliveryProvince(e.target.value as SouthAfricanProvince)}
                      className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      {Object.keys(SA_PROVINCES_GEO).map((prov) => (
                        <option key={prov} value={prov}>
                          {prov} {prov === selectedListing.locationProvince ? '(Seller Location - Local Pickup)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Calculated Estimate Details */}
                <div className="p-3 bg-slate-900/90 border border-slate-700/60 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Estimated Delivery Freight</span>
                      <span className="text-xl font-black text-amber-400 font-sans">
                        {formatZAR(deliveryEstimate.estimatedCostZAR)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-block ${
                        deliveryEstimate.routeTier === 'local'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : deliveryEstimate.routeTier === 'regional'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {deliveryEstimate.courierService}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                        {deliveryEstimate.distanceKm > 0 ? `~${deliveryEstimate.distanceKm} km transit` : 'Intra-provincial'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Transit: <strong>{deliveryEstimate.deliveryDays}</strong></span>
                    </div>
                    {deliveryEstimate.isLocalPickupAvailable ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Counter Collection Free
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Door-to-door road courier
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5">
                    {deliveryEstimate.breakdownNotice}
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
