import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageCircle, 
  X, 
  ShieldCheck, 
  Send, 
  HelpCircle, 
  Truck, 
  Wrench, 
  ExternalLink,
  ChevronUp,
  Sparkles,
  Phone
} from 'lucide-react';

export const WhatsAppQuickWidget: React.FC = () => {
  const { role, openWhatsAppChat, setIsRequestPartOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Only show floating WhatsApp assistant for buyer role
  if (role !== 'buyer') return null;

  const handleSupportChat = (intentTopic: string) => {
    setIsOpen(false);
    openWhatsAppChat(undefined, 'general', {
      name: 'Part Source ZA Verified Parts Desk',
      phone: '+27 11 824 5500',
      whatsapp: '+27 82 459 1029',
      locationCity: 'Johannesburg',
      locationProvince: 'Gauteng'
    });
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 font-sans">
      
      {/* Expanded Quick WhatsApp Drawer */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-800 to-emerald-950 border-b border-emerald-600/40 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <MessageCircle className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight">DIRECT WHATSAPP DESK</h4>
                <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified Scrap Yards & Parts Support
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-3.5 space-y-2 text-xs">
            <p className="text-[11px] text-slate-300">
              Need immediate assistance locating a scrap yard engine, gearbox, or OEM truck component?
            </p>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleSupportChat('Rare Part Locating')}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-200">Find Rare / Stripping Spares</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">WhatsApp →</span>
              </button>

              <button
                onClick={() => handleSupportChat('Freight & Delivery')}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-200">Courier & Inter-City Freight</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">WhatsApp →</span>
              </button>

              <button
                onClick={() => handleSupportChat('Scrap Yard Verification')}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-slate-200">Verify a Dismantler / Yard</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">WhatsApp →</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 font-mono text-emerald-300">
                <Phone className="w-3 h-3 text-emerald-400" />
                +27 82 459 1029
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsRequestPartOpen(true);
                }}
                className="text-amber-400 hover:underline font-semibold"
              >
                Broadcast Part Request
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Floating Pill / Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-600/40 border border-emerald-400/40 transition-all hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-emerald-600 absolute -top-1 -right-1 animate-pulse"></span>
        </div>
        <span className="text-xs font-black tracking-wide pr-1">
          WhatsApp Sellers
        </span>
      </button>

    </div>
  );
};
