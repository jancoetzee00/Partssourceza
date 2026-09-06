import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MessageCircle, 
  Eye, 
  GitCompare, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  Camera, 
  Sparkles, 
  Wrench, 
  Box,
  Truck
} from 'lucide-react';
import { Listing } from '../types';

interface PartGalleryLightboxModalProps {
  listing: Listing | null;
  initialIndex?: number;
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onWhatsAppChat: (listing: Listing) => void;
  onAddToCompare: (listing: Listing) => void;
  onRemoveFromCompare: (listingId: string) => void;
  inCompare: boolean;
  formatZAR: (amount: number) => string;
}

export const PartGalleryLightboxModal: React.FC<PartGalleryLightboxModalProps> = ({
  listing,
  initialIndex = 0,
  onClose,
  onSelectListing,
  onWhatsAppChat,
  onAddToCompare,
  onRemoveFromCompare,
  inCompare,
  formatZAR
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Sync initial index if prop changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
  }, [initialIndex, listing]);

  // Keyboard navigation
  useEffect(() => {
    if (!listing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : listing.images.length - 1));
        setZoomLevel(1);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev < listing.images.length - 1 ? prev + 1 : 0));
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, onClose]);

  if (!listing) return null;

  const images = listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'];
  const activeImage = images[currentIndex] || images[0];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl text-white select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo Gallery for ${listing.title}`}
    >
      {/* Top Controls Bar */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-400">
                {listing.make} {listing.model} ({listing.yearStart}-{listing.yearEnd})
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                PN: {listing.partNumber}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-semibold text-white truncate max-w-md sm:max-w-xl">
              {listing.title}
            </h2>
          </div>
        </div>

        {/* Action icons & close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-[11px] font-mono text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded text-amber-400 hover:text-amber-300 transition-colors"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close gallery (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-2 sm:p-6">
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 z-20 p-3 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white hover:text-amber-400 shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="Previous photo (Left arrow)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-6 z-20 p-3 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white hover:text-amber-400 shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
              title="Next photo (Right arrow)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Image Container with zoom & pan */}
        <div 
          className="relative max-w-5xl max-h-full flex items-center justify-center transition-transform duration-200 overflow-hidden"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={activeImage}
            alt={`${listing.title} - View ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-[60vh] sm:max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-800/90"
            onClick={handleZoomIn}
          />
        </div>

        {/* Counter Badge */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-200 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>Photo {currentIndex + 1} of {images.length}</span>
        </div>

        {/* Condition Tag */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
            {listing.condition.includes('Brand New') ? (
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            ) : listing.condition.includes('Reconditioned') ? (
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Box className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{listing.condition}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-amber-400 backdrop-blur-md flex items-center gap-1 shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{listing.warrantyMonths} Mo Warranty</span>
          </span>
        </div>
      </div>

      {/* Bottom Thumbnails & Action Dock */}
      <div className="border-t border-slate-800/90 bg-slate-900/95 backdrop-blur-md px-4 py-3 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Thumbnail strip */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoomLevel(1);
                }}
                className={`relative w-14 h-12 sm:w-16 sm:h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  currentIndex === idx
                    ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20'
                    : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 right-1 text-[9px] font-bold font-mono text-white bg-black/70 px-1 rounded">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Pricing & Supplier info */}
          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            <div className="text-left md:text-right">
              <div className="text-lg sm:text-2xl font-black text-white font-sans tracking-tight">
                {formatZAR(listing.priceZAR)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>{listing.sellerName} ({listing.locationProvince})</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inCompare ? onRemoveFromCompare(listing.id) : onAddToCompare(listing)}
                className={`p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  inCompare
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
                title="Add to Comparison Matrix"
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">{inCompare ? 'In Matrix' : 'Compare'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectListing(listing);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>View Full Specs</span>
              </button>

              <button
                type="button"
                onClick={() => onWhatsAppChat(listing)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Inquire on WhatsApp</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
