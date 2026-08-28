import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Trash2, 
  Check, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  Phone, 
  CreditCard, 
  Plus, 
  GitCompare,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Listing } from '../types';

export const PartCompareModal: React.FC = () => {
  const { 
    compareList, 
    isCompareOpen, 
    setIsCompareOpen, 
    removeFromCompare, 
    clearCompare, 
    setSelectedListing,
    setIsCheckoutOpen
  } = useApp();

  if (!isCompareOpen) return null;

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Spares Comparison Matrix ({compareList.length}/4)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table / Matrix */}
        <div className="overflow-x-auto p-6 flex-1">
          {compareList.length === 0 ? (
            <div className="text-center py-16">
              <GitCompare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No auto or truck parts selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Browse our marketplace and click the "Compare" button on any listing to inspect side-by-side specs, prices, and warranties.
              </p>
            </div>
          ) : (
            <div className="min-w-[700px]">
              
              {/* Top Row: Part Previews */}
              <div className="grid grid-cols-5 gap-4 pb-6 border-b border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-end pb-2">
                  Selected Component
                </div>
                {compareList.map(item => (
                  <div key={item.id} className="relative bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col justify-between">
                    <button
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-slate-400 hover:text-red-400 hover:bg-black transition-colors"
                      title="Remove from compare"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                      <h4 className="text-xs font-bold text-white line-clamp-2 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] font-mono text-amber-400">{item.partNumber}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800">
                      <span className="text-sm font-extrabold text-white block">
                        {formatZAR(item.priceZAR)}
                      </span>
                    </div>
                  </div>
                ))}
                {/* Empty placeholder slot if < 4 */}
                {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center text-slate-600">
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-[11px]">Add Part to Slot</span>
                  </div>
                ))}
              </div>

              {/* Comparison Attribute Rows */}
              <div className="divide-y divide-slate-800 text-xs">
                
                {/* Condition */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Condition
                  </div>
                  {compareList.map(item => (
                    <div key={item.id} className="font-semibold text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                        {item.condition}
                      </span>
                    </div>
                  ))}
                  {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                    <div key={`c-${i}`} className="text-slate-600">-</div>
                  ))}
                </div>

                {/* Make & Model */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Vehicle Compatibility
                  </div>
                  {compareList.map(item => (
                    <div key={item.id} className="text-slate-300">
                      <span className="font-bold text-white block">{item.make} {item.model}</span>
                      <span className="text-slate-400 text-[11px] font-mono">{item.yearStart} - {item.yearEnd}</span>
                    </div>
                  ))}
                  {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                    <div key={`m-${i}`} className="text-slate-600">-</div>
                  ))}
                </div>

                {/* Warranty */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Supplier Warranty
                  </div>
                  {compareList.map(item => (
                    <div key={item.id} className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{item.warrantyMonths} Months Guarantee</span>
                    </div>
                  ))}
                  {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                    <div key={`w-${i}`} className="text-slate-600">-</div>
                  ))}
                </div>

                {/* Location & Delivery */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Location & Courier
                  </div>
                  {compareList.map(item => (
                    <div key={item.id} className="text-slate-300">
                      <div className="flex items-center gap-1 text-slate-200 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{item.locationProvince}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.deliveryDaysEstimate} (R{item.deliveryCostZAR})
                      </p>
                    </div>
                  ))}
                  {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                    <div key={`l-${i}`} className="text-slate-600">-</div>
                  ))}
                </div>

                {/* Supplier & Rating */}
                <div className="grid grid-cols-5 gap-4 py-3.5 items-center">
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Supplier & Rating
                  </div>
                  {compareList.map(item => (
                    <div key={item.id} className="text-slate-300">
                      <p className="font-semibold text-white truncate">{item.sellerName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-400 font-bold text-[11px]">★ {item.sellerRating}</span>
                        {item.sellerVerified && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-600/40">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                    <div key={`s-${i}`} className="text-slate-600">-</div>
                  ))}
                </div>

                {/* Direct Action Row */}
                <div className="grid grid-cols-5 gap-4 py-4 items-center">
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                    Action
                  </div>
                  {compareList.map(item => {
                    const waMessage = encodeURIComponent(
                      `Hi ${item.sellerName}, I am comparing your ${item.title} (PN: ${item.partNumber}) for ${formatZAR(item.priceZAR)} on Part Source ZA. Is it ready for shipping?`
                    );
                    const waLink = `https://wa.me/${item.sellerWhatsApp.replace(/[^0-9]/g, '')}?text=${waMessage}`;

                    return (
                      <div key={item.id} className="space-y-1.5">
                        <button
                          onClick={() => {
                            setSelectedListing(item);
                            setIsCompareOpen(false);
                          }}
                          className="w-full py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View / Buy</span>
                        </button>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1 px-2 bg-emerald-900/60 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    );
                  })}
                  {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                    <div key={`a-${i}`} className="text-slate-600">-</div>
                  ))}
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
