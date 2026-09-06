import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { 
  MessageCircle, 
  Eye, 
  GitCompare, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Wrench, 
  Box, 
  CheckCheck,
  Phone,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  Camera,
  Car,
  Truck
} from 'lucide-react';
import { Listing } from '../types';

interface SwipeableListingCardProps {
  listing: Listing;
  viewDensity: 'gallery' | 'compact' | 'comfort' | 'list';
  inCompare: boolean;
  isExactFit: boolean;
  isNewCondition: boolean;
  isReconditioned: boolean;
  onSelectListing: (listing: Listing) => void;
  onAddToCompare: (listing: Listing) => void;
  onRemoveFromCompare: (listingId: string) => void;
  onWhatsAppChat: (listing: Listing) => void;
  onOpenLightbox?: (listing: Listing, initialIndex?: number) => void;
  formatZAR: (amount: number) => string;
  selectedProvince?: string;
}

export const SwipeableListingCard: React.FC<SwipeableListingCardProps> = ({
  listing,
  viewDensity,
  inCompare,
  isExactFit,
  isNewCondition,
  isReconditioned,
  onSelectListing,
  onAddToCompare,
  onRemoveFromCompare,
  onWhatsAppChat,
  onOpenLightbox,
  formatZAR,
  selectedProvince
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'];
  const currentImage = images[activeImageIndex] || images[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onOpenLightbox) {
      onOpenLightbox(listing, activeImageIndex);
    } else {
      onSelectListing(listing);
    }
  };

  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeTriggered, setSwipeTriggered] = useState<'whatsapp' | 'details' | null>(null);

  // Background action indicators opacity and scale based on drag distance
  const whatsappOpacity = useTransform(x, [10, 60, 110], [0.3, 0.8, 1]);
  const whatsappScale = useTransform(x, [10, 75], [0.85, 1.05]);
  const detailsOpacity = useTransform(x, [-10, -60, -110], [0.3, 0.8, 1]);
  const detailsScale = useTransform(x, [-10, -75], [0.85, 1.05]);

  const handleDragStart = () => {
    setIsDragging(true);
    setSwipeTriggered(null);
  };

  const handleDrag = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 65) {
      setSwipeTriggered('whatsapp');
    } else if (info.offset.x < -65) {
      setSwipeTriggered('details');
    } else {
      setSwipeTriggered(null);
    }
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false);
    
    // Swipe Right -> Direct WhatsApp Supplier
    if (info.offset.x > 70 || info.velocity.x > 250) {
      if ('vibrate' in navigator) {
        try { navigator.vibrate(35); } catch {}
      }
      onWhatsAppChat(listing);
    } 
    // Swipe Left -> View Details & Purchase
    else if (info.offset.x < -70 || info.velocity.x < -250) {
      if ('vibrate' in navigator) {
        try { navigator.vibrate(35); } catch {}
      }
      onSelectListing(listing);
    }

    setSwipeTriggered(null);
  };

  /* ========================================================================= */
  /* 1. LIST VIEW CARD WITH HORIZONTAL SWIPE-TO-CONTACT                       */
  /* ========================================================================= */
  if (viewDensity === 'list') {
    return (
      <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-md group">
        {/* UNDERLYING SWIPE ACTION TRAY */}
        <div className="absolute inset-0 flex items-stretch justify-between pointer-events-none z-0">
          {/* Left tray: Swipe Right -> WhatsApp */}
          <motion.div 
            style={{ opacity: whatsappOpacity }}
            className="flex items-center gap-2 pl-4 pr-6 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 text-white pointer-events-auto"
          >
            <motion.div style={{ scale: whatsappScale }} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <MessageCircle className="w-4 h-4 text-white fill-white/20" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black block tracking-tight">
                  {swipeTriggered === 'whatsapp' ? 'Release to Chat! 💬' : 'Swipe to WhatsApp'}
                </span>
                <span className="text-[9px] text-emerald-100/90 font-medium">Direct Supplier Chat</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right tray: Swipe Left -> View Details */}
          <motion.div 
            style={{ opacity: detailsOpacity }}
            className="flex items-center justify-end gap-2 pr-4 pl-6 bg-gradient-to-l from-amber-600 via-amber-600 to-amber-700 text-white pointer-events-auto"
          >
            <motion.div style={{ scale: detailsScale }} className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs font-black block tracking-tight">
                  {swipeTriggered === 'details' ? 'Release to View! 🔍' : 'Swipe for Details'}
                </span>
                <span className="text-[9px] text-amber-100/90 font-medium">Specs & Checkout</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* FOREGROUND SWIPEABLE ROW */}
        <motion.div
          style={{ x }}
          drag="x"
          dragDirectionLock={true}
          dragConstraints={{ left: -110, right: 110 }}
          dragElastic={0.2}
          dragSnapToOrigin={true}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative z-10 bg-slate-900 hover:border-slate-700 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 touch-pan-y select-none transition-colors"
        >
          {/* Mobile Micro Swipe Affordance Bar */}
          <div className="w-full flex items-center justify-between sm:hidden text-[9px] text-slate-500 pb-1.5 border-b border-slate-800/80 font-medium">
            <span className="flex items-center gap-1 text-emerald-400/90">
              <MessageCircle className="w-2.5 h-2.5" /> 👉 Swipe right to WhatsApp
            </span>
            <span className="flex items-center gap-1 text-amber-400/90">
              Details 👈
            </span>
          </div>

          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div 
              className="relative w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0 cursor-pointer"
              onClick={() => !isDragging && onSelectListing(listing)}
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
                onClick={() => !isDragging && onSelectListing(listing)}
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
                type="button"
                onClick={() => inCompare ? onRemoveFromCompare(listing.id) : onAddToCompare(listing)}
                className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap ${
                  inCompare 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
                title="Compare"
              >
                <GitCompare className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">{inCompare ? 'Added' : 'Compare'}</span>
              </button>
              <button
                type="button"
                onClick={() => onWhatsAppChat(listing)}
                className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-[10px] transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                title="WhatsApp Supplier (or swipe right)"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden md:inline font-medium">WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectListing(listing)}
                className="px-2.5 sm:px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-amber-600/20 cursor-pointer shrink-0 whitespace-nowrap"
              >
                Details / Buy
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 2. VISUAL IMAGE GALLERY GRID CARD (HIGH IMPACT MULTI-ANGLE INSPECTION)   */
  /* ========================================================================= */
  if (viewDensity === 'gallery') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-xl group hover:border-slate-700 transition-all duration-300 flex flex-col justify-between h-full">
        {/* UNDERLYING SWIPE ACTION TRAY */}
        <div className="absolute inset-0 flex items-stretch justify-between pointer-events-none z-0">
          <motion.div 
            style={{ opacity: whatsappOpacity }}
            className="flex items-center gap-2 pl-4 pr-6 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 text-white"
          >
            <motion.div style={{ scale: whatsappScale }} className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1 shadow-md">
                <MessageCircle className="w-5 h-5 text-white fill-white/20" />
              </div>
              <span className="text-[10px] font-black leading-tight text-center">
                {swipeTriggered === 'whatsapp' ? 'Release to Chat! 💬' : 'Swipe to WhatsApp'}
              </span>
              <span className="text-[8px] text-emerald-100/80">Direct Supplier</span>
            </motion.div>
          </motion.div>

          <motion.div 
            style={{ opacity: detailsOpacity }}
            className="flex items-center justify-end gap-2 pr-4 pl-6 bg-gradient-to-l from-amber-600 via-amber-600 to-amber-700 text-white"
          >
            <motion.div style={{ scale: detailsScale }} className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1 shadow-md">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black leading-tight text-center">
                {swipeTriggered === 'details' ? 'Release to View! 🔍' : 'Swipe for Specs'}
              </span>
              <span className="text-[8px] text-amber-100/80">Specs & Buy</span>
            </motion.div>
          </motion.div>
        </div>

        {/* FOREGROUND CARD */}
        <motion.div
          style={{ x }}
          drag="x"
          dragDirectionLock={true}
          dragConstraints={{ left: -100, right: 100 }}
          dragElastic={0.2}
          dragSnapToOrigin={true}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative z-10 bg-slate-900 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between h-full touch-pan-y select-none transition-colors"
        >
          <div>
            {/* Mobile Swipe Gesture Hint */}
            <div className="sm:hidden px-3 py-1 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[8px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <MessageCircle className="w-2.5 h-2.5" /> 👉 Swipe WhatsApp
              </span>
              <span className="text-amber-400">
                Specs 👈
              </span>
            </div>

            {/* Visual Image Stage with multi-photo switching */}
            <div 
              className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer group/img"
              onClick={() => !isDragging && onSelectListing(listing)}
            >
              <img
                src={currentImage}
                alt={`${listing.title} - View ${activeImageIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Prev / Next Photo Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/10 backdrop-blur-md opacity-90 sm:opacity-0 group-hover/img:opacity-100 transition-all z-20 cursor-pointer shadow-lg"
                    title="Previous photo angle"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/10 backdrop-blur-md opacity-90 sm:opacity-0 group-hover/img:opacity-100 transition-all z-20 cursor-pointer shadow-lg"
                    title="Next photo angle"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Badges Top Left: Condition & Fitment */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
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

              {/* Badges Top Right: Counter & Lightbox Quick Zoom */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white flex items-center gap-1 shadow-md">
                  <Camera className="w-2.5 h-2.5 text-amber-400" />
                  <span>{activeImageIndex + 1}/{images.length}</span>
                </span>

                <button
                  type="button"
                  onClick={handleZoom}
                  className="p-1.5 rounded-md bg-black/75 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer shadow-md"
                  title="Inspect photo in full-screen gallery"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Overlay Bottom of Image: Warranty & Province */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] text-white font-mono z-10 pointer-events-none">
                <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>{listing.warrantyMonths} Mo Warranty</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded backdrop-blur-sm border flex items-center gap-1 ${
                  selectedProvince && listing.locationProvince === selectedProvince
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-black/80 text-white border-white/10'
                }`}>
                  <MapPin className={`w-3 h-3 ${selectedProvince && listing.locationProvince === selectedProvince ? 'text-slate-950' : 'text-amber-500'}`} />
                  <span>{listing.locationProvince}</span>
                </span>
              </div>
            </div>

            {/* Clickable Multi-Angle Thumbnail Strip */}
            {images.length > 1 && (
              <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800/90 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setActiveImageIndex(idx);
                      }}
                      className={`relative w-9 h-7 rounded overflow-hidden border transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-amber-400 ring-1 ring-amber-400/60 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                      title={`View angle ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Angle ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleZoom}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 shrink-0 px-1 py-0.5 rounded hover:bg-slate-800/60"
                  title="Open Gallery Lightbox"
                >
                  <Eye className="w-3 h-3" />
                  <span className="hidden sm:inline">Gallery</span>
                </button>
              </div>
            )}

            {/* Content Details */}
            <div className="p-3.5 sm:p-4">
              {/* Vehicle Fitment */}
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-amber-400">
                <Car className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{listing.make} {listing.model}</span>
                <span className="text-slate-600 shrink-0">•</span>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">{listing.yearStart}-{listing.yearEnd}</span>
              </div>

              {/* Title */}
              <h3 
                onClick={() => !isDragging && onSelectListing(listing)}
                className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer mb-2 leading-snug"
                title={listing.title}
              >
                {listing.title}
              </h3>

              {/* Part ID & OEM numbers */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[10px] text-slate-400 font-mono">
                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                  PN: {listing.partNumber}
                </span>
                {listing.oemNumber && (
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-500">
                    OEM: {listing.oemNumber}
                  </span>
                )}
                {listing.engineSpec && (
                  <span className="bg-slate-950/60 px-2 py-0.5 rounded text-amber-400/90 border border-slate-800/80 truncate max-w-[150px]">
                    {listing.engineSpec}
                  </span>
                )}
              </div>

              {/* Supplier & Rating */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 truncate max-w-[150px]">
                  {listing.sellerName}
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
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
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 line-through font-mono">
                    {formatZAR(listing.originalPriceZAR)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1 py-0.2 rounded">
                    Save {formatZAR(listing.originalPriceZAR - listing.priceZAR)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => inCompare ? onRemoveFromCompare(listing.id) : onAddToCompare(listing)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0 ${
                  inCompare 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{inCompare ? 'In Matrix' : 'Compare'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectListing(listing)}
                className="px-2.5 sm:px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-600/20 cursor-pointer whitespace-nowrap min-w-0"
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Details / Buy</span>
              </button>
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => onWhatsAppChat(listing)}
                className="w-full py-2 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950/30 whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20 shrink-0" />
                <span className="truncate">Direct WhatsApp Supplier</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 3. COMPACT GRID VIEW CARD WITH SWIPE-TO-CONTACT                          */
  /* ========================================================================= */
  if (viewDensity === 'compact') {
    return (
      <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800 shadow-md group">
        {/* UNDERLYING SWIPE ACTION TRAY */}
        <div className="absolute inset-0 flex items-stretch justify-between pointer-events-none z-0">
          <motion.div 
            style={{ opacity: whatsappOpacity }}
            className="flex items-center gap-1.5 pl-3 pr-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
          >
            <motion.div style={{ scale: whatsappScale }} className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                <MessageCircle className="w-3.5 h-3.5 text-white fill-white/20" />
              </div>
              <span className="text-[9px] font-black leading-tight text-center">
                {swipeTriggered === 'whatsapp' ? 'Release!' : 'WhatsApp'}
              </span>
            </motion.div>
          </motion.div>

          <motion.div 
            style={{ opacity: detailsOpacity }}
            className="flex items-center justify-end gap-1.5 pr-3 pl-4 bg-gradient-to-l from-amber-600 to-amber-700 text-white"
          >
            <motion.div style={{ scale: detailsScale }} className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1">
                <Eye className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[9px] font-black leading-tight text-center">
                {swipeTriggered === 'details' ? 'Release!' : 'Details'}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* FOREGROUND CARD */}
        <motion.div
          style={{ x }}
          drag="x"
          dragDirectionLock={true}
          dragConstraints={{ left: -90, right: 90 }}
          dragElastic={0.2}
          dragSnapToOrigin={true}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative z-10 bg-slate-900 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between h-full touch-pan-y select-none transition-colors"
        >
          <div>
            {/* Mobile swipe gesture hint bar */}
            <div className="sm:hidden px-2 py-1 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[8px] text-slate-400 font-medium">
              <span className="flex items-center gap-0.5 text-emerald-400">
                <MessageCircle className="w-2.5 h-2.5" /> Swipe 👉 WhatsApp
              </span>
              <span className="text-slate-500">
                👈 Specs
              </span>
            </div>

            {/* Compact Image & Badges */}
            <div 
              className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer group/compimg" 
              onClick={() => !isDragging && onSelectListing(listing)}
            >
              <img
                src={currentImage}
                alt={listing.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Prev / Next Photo Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/70 hover:bg-black text-white border border-white/10 opacity-80 sm:opacity-0 group-hover/compimg:opacity-100 transition-opacity z-20 cursor-pointer shadow"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/70 hover:bg-black text-white border border-white/10 opacity-80 sm:opacity-0 group-hover/compimg:opacity-100 transition-opacity z-20 cursor-pointer shadow"
                    title="Next photo"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
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

              {/* Counter & Zoom Button */}
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                {images.length > 1 && (
                  <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-white/10 text-[8px] font-mono text-white">
                    {activeImageIndex + 1}/{images.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleZoom}
                  className="p-1 rounded bg-black/75 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/10 backdrop-blur-sm transition-colors cursor-pointer"
                  title="Inspect photo in full-screen gallery"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>

              {/* Compact Bottom overlay */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] sm:text-[9px] text-white font-mono z-10 pointer-events-none">
                <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                  <span>{listing.warrantyMonths}M War.</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded backdrop-blur-sm border flex items-center gap-0.5 truncate max-w-[50%] ${
                  selectedProvince && listing.locationProvince === selectedProvince
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-black/80 text-white border-white/10'
                }`}>
                  <MapPin className={`w-2.5 h-2.5 shrink-0 ${selectedProvince && listing.locationProvince === selectedProvince ? 'text-slate-950' : 'text-amber-500'}`} />
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
                onClick={() => !isDragging && onSelectListing(listing)}
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
                type="button"
                onClick={() => inCompare ? onRemoveFromCompare(listing.id) : onAddToCompare(listing)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap min-w-0 ${
                  inCompare 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
              >
                <GitCompare className="w-3 h-3 shrink-0" />
                <span className="truncate">{inCompare ? 'Added' : 'Compare'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectListing(listing)}
                className="py-1.5 px-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-600/20 cursor-pointer whitespace-nowrap min-w-0"
              >
                <Eye className="w-3 h-3 shrink-0" />
                <span className="truncate">Buy</span>
              </button>
            </div>

            {/* WhatsApp Quick Direct Action */}
            <div className="mt-1.5">
              <button
                type="button"
                onClick={() => onWhatsAppChat(listing)}
                className="w-full py-1 px-2 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 3. COMFORT GRID VIEW CARD WITH SWIPE-TO-CONTACT                          */
  /* ========================================================================= */
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-xl group">
      {/* UNDERLYING SWIPE ACTION TRAY */}
      <div className="absolute inset-0 flex items-stretch justify-between pointer-events-none z-0">
        <motion.div 
          style={{ opacity: whatsappOpacity }}
          className="flex items-center gap-2 pl-4 pr-6 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 text-white"
        >
          <motion.div style={{ scale: whatsappScale }} className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1 shadow-md">
              <MessageCircle className="w-5 h-5 text-white fill-white/20" />
            </div>
            <span className="text-[10px] font-black leading-tight text-center">
              {swipeTriggered === 'whatsapp' ? 'Release to Chat! 💬' : 'Swipe to WhatsApp'}
            </span>
            <span className="text-[8px] text-emerald-100/80">Direct Supplier</span>
          </motion.div>
        </motion.div>

        <motion.div 
          style={{ opacity: detailsOpacity }}
          className="flex items-center justify-end gap-2 pr-4 pl-6 bg-gradient-to-l from-amber-600 via-amber-600 to-amber-700 text-white"
        >
          <motion.div style={{ scale: detailsScale }} className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1 shadow-md">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black leading-tight text-center">
              {swipeTriggered === 'details' ? 'Release to View! 🔍' : 'Swipe for Details'}
            </span>
            <span className="text-[8px] text-amber-100/80">Specs & Buy</span>
          </motion.div>
        </motion.div>
      </div>

      {/* FOREGROUND CARD */}
      <motion.div
        style={{ x }}
        drag="x"
        dragDirectionLock={true}
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        dragSnapToOrigin={true}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-slate-900 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between h-full touch-pan-y select-none transition-colors"
      >
        <div>
          {/* Mobile Swipe Gesture Hint */}
          <div className="sm:hidden px-3 py-1 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[8px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <MessageCircle className="w-2.5 h-2.5" /> 👉 Swipe right to WhatsApp
            </span>
            <span className="text-amber-400">
              Details 👈
            </span>
          </div>

          {/* Image & Badges */}
          <div 
            className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer group/comfortimg" 
            onClick={() => !isDragging && onSelectListing(listing)}
          >
            <img
              src={currentImage}
              alt={listing.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Prev / Next Photo Buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 opacity-80 sm:opacity-0 group-hover/comfortimg:opacity-100 transition-opacity z-20 cursor-pointer shadow-md"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 opacity-80 sm:opacity-0 group-hover/comfortimg:opacity-100 transition-opacity z-20 cursor-pointer shadow-md"
                  title="Next photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
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

            {/* Counter & Zoom Button */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
              <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white flex items-center gap-1">
                <Camera className="w-2.5 h-2.5 text-amber-400" />
                <span>{activeImageIndex + 1}/{images.length}</span>
              </span>
              <button
                type="button"
                onClick={handleZoom}
                className="p-1 rounded-md bg-black/75 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
                title="Inspect photo in full-screen gallery"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] text-white font-mono z-10 pointer-events-none">
              <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>{listing.warrantyMonths} Mo Warranty</span>
              </span>
              <span className={`px-1.5 py-0.5 rounded backdrop-blur-sm border flex items-center gap-1 ${
                selectedProvince && listing.locationProvince === selectedProvince
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
              onClick={() => !isDragging && onSelectListing(listing)}
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
              type="button"
              onClick={() => inCompare ? onRemoveFromCompare(listing.id) : onAddToCompare(listing)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap min-w-0 ${
                inCompare 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{inCompare ? 'In Matrix' : 'Compare'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectListing(listing)}
              className="px-2.5 sm:px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-amber-600/20 cursor-pointer whitespace-nowrap min-w-0"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Details / Buy</span>
            </button>
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={() => onWhatsAppChat(listing)}
              className="w-full py-1.5 px-3 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20 shrink-0" />
              <span className="truncate">Direct WhatsApp Supplier</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
