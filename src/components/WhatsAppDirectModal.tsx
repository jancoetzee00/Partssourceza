import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  Phone, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Sparkles, 
  Camera, 
  HelpCircle, 
  Cpu, 
  FileText, 
  Clock, 
  Lock, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { WhatsAppIntentType, Listing } from '../types';

export const WhatsAppDirectModal: React.FC = () => {
  const { 
    isWhatsAppModalOpen, 
    setIsWhatsAppModalOpen, 
    whatsAppModalData,
    createInquiry,
    showNotification
  } = useApp();

  const [intent, setIntent] = useState<WhatsAppIntentType>('availability');
  const [buyerName, setBuyerName] = useState(() => {
    return localStorage.getItem('partsource_buyer_name') || '';
  });
  const [buyerPhone, setBuyerPhone] = useState(() => {
    return localStorage.getItem('partsource_buyer_phone') || '';
  });
  const [buyerVehicle, setBuyerVehicle] = useState('');
  const [buyerVin, setBuyerVin] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Initialize defaults when modal opens
  useEffect(() => {
    if (whatsAppModalData?.defaultIntent) {
      setIntent(whatsAppModalData.defaultIntent);
    } else {
      setIntent('availability');
    }
    setMessageSent(false);
    setCopied(false);
  }, [whatsAppModalData, isWhatsAppModalOpen]);

  // Persist name & phone for convenience
  useEffect(() => {
    if (buyerName) localStorage.setItem('partsource_buyer_name', buyerName);
    if (buyerPhone) localStorage.setItem('partsource_buyer_phone', buyerPhone);
  }, [buyerName, buyerPhone]);

  if (!isWhatsAppModalOpen) return null;

  const listing: Listing | undefined = whatsAppModalData?.listing;
  const customSeller = whatsAppModalData?.customSeller;

  // Resolve seller info
  const sellerName = listing?.sellerName || customSeller?.name || 'Part Source Verified Auto Dismantler';
  const rawWhatsApp = listing?.sellerWhatsApp || customSeller?.whatsapp || '+27 82 459 1029';
  const sellerPhone = listing?.sellerPhone || customSeller?.phone || '+27 11 824 5500';
  const sellerLocation = listing 
    ? `${listing.locationCity}, ${listing.locationProvince}` 
    : (customSeller?.locationCity ? `${customSeller.locationCity}, ${customSeller.locationProvince}` : 'Johannesburg, Gauteng');
  
  // Format clean international WhatsApp phone number (e.g. 27824591029)
  const cleanWhatsAppNumber = rawWhatsApp.replace(/[^0-9]/g, '');
  const formattedWhatsAppNumber = cleanWhatsAppNumber.startsWith('0') 
    ? '27' + cleanWhatsAppNumber.slice(1) 
    : cleanWhatsAppNumber;

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Intent configurations
  const intentOptions: { id: WhatsAppIntentType; title: string; subtitle: string; icon: any }[] = [
    {
      id: 'availability',
      title: 'Stock & Dispatch Check',
      subtitle: 'Confirm immediate yard stock and pickup time',
      icon: Clock
    },
    {
      id: 'condition_photos',
      title: 'Photos & Condition Video',
      subtitle: 'Request 360° closeups & operational testing video',
      icon: Camera
    },
    {
      id: 'vin_fitment',
      title: 'VIN / Engine Fitment Check',
      subtitle: 'Verify compatibility with your vehicle chassis/VIN',
      icon: Cpu
    },
    {
      id: 'courier_quote',
      title: 'Door-to-Door Courier Quote',
      subtitle: 'Get accurate courier cost & delivery turnaround',
      icon: Truck
    },
    {
      id: 'collection',
      title: 'Book Yard Collection',
      subtitle: 'Arrange in-person inspection and scrap yard collection',
      icon: MapPin
    },
    {
      id: 'fleet_pricing',
      title: 'Trade & Fleet Pricing',
      subtitle: 'Negotiate workshop or multi-unit order discount',
      icon: Sparkles
    }
  ];

  // Construct structured WhatsApp message text with markdown
  const compiledMessage = useMemo(() => {
    const lines: string[] = [];

    // Greeting
    lines.push(`👋 *Hello ${sellerName}*,`);
    lines.push(`I found your listing on *Part Source ZA* and would like to inquire directly via WhatsApp.`);
    lines.push('');

    // Part details if listing is present
    if (listing) {
      lines.push(`📦 *COMPONENT INQUIRY:*`);
      lines.push(`• *Part:* ${listing.title}`);
      lines.push(`• *Part / OEM No:* ${listing.partNumber || listing.oemNumber || 'OEM Standard'}`);
      lines.push(`• *Application:* ${listing.make} ${listing.model} (${listing.yearStart}-${listing.yearEnd})`);
      if (listing.engineSpec) lines.push(`• *Engine Spec:* ${listing.engineSpec}`);
      lines.push(`• *Condition:* ${listing.condition}`);
      lines.push(`• *Listed Price:* ${formatZAR(listing.priceZAR)} (incl. VAT)`);
      lines.push(`• *Yard Location:* ${sellerLocation}`);
      lines.push('');
    }

    // Specific intent questions
    lines.push(`🔍 *SPECIFIC INQUIRY / REQUEST:*`);
    switch (intent) {
      case 'availability':
        lines.push(`1. Is this exact unit currently available in stock at your yard?`);
        lines.push(`2. How soon can this be dispatched or made ready for collection?`);
        break;
      case 'condition_photos':
        lines.push(`1. Please send me close-up photos of the part, plugs/mounts, and label.`);
        lines.push(`2. Do you have a video of this component (or engine running / compression test)?`);
        break;
      case 'vin_fitment':
        lines.push(`1. I would like to verify fitment for my vehicle:`);
        if (buyerVehicle) lines.push(`   - Vehicle: ${buyerVehicle}`);
        if (buyerVin) lines.push(`   - VIN / Engine No: ${buyerVin}`);
        lines.push(`2. Can you confirm this OEM number is 100% plug-and-play compatible?`);
        break;
      case 'courier_quote':
        lines.push(`1. Please provide a door-to-door courier freight quote:`);
        lines.push(`   - Destination: ${deliveryCity || 'My Town/City'}`);
        lines.push(`2. What is the estimated transit time (e.g. The Courier Guy / Dawn Wing)?`);
        break;
      case 'collection':
        lines.push(`1. I would like to arrange in-person collection at your workshop/yard.`);
        lines.push(`2. What are your operating hours and exact collection address?`);
        break;
      case 'fleet_pricing':
        lines.push(`1. I am inquiring as a workshop / fleet buyer.`);
        lines.push(`2. What is your best cash/trade price for this unit or multiple units?`);
        break;
      default:
        lines.push(`1. Please provide additional information on this unit.`);
    }

    if (customMessage.trim()) {
      lines.push('');
      lines.push(`💬 *ADDITIONAL NOTES:*`);
      lines.push(customMessage.trim());
    }

    // Buyer Contact signature
    lines.push('');
    lines.push(`👤 *BUYER CONTACT:*`);
    lines.push(`• Name: ${buyerName || 'Buyer'}`);
    if (buyerPhone) lines.push(`• Phone/WhatsApp: ${buyerPhone}`);
    if (deliveryCity && intent !== 'courier_quote') lines.push(`• Location: ${deliveryCity}`);
    lines.push(`• Reference Platform: Part Source ZA (Ref: ${listing ? listing.id : 'DIRECT'})`);

    return lines.join('\n');
  }, [sellerName, listing, sellerLocation, intent, buyerVehicle, buyerVin, deliveryCity, customMessage, buyerName, buyerPhone]);

  // Formatted link for opening WhatsApp
  const waLink = `https://wa.me/${formattedWhatsAppNumber}?text=${encodeURIComponent(compiledMessage)}`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compiledMessage);
      setCopied(true);
      showNotification('WhatsApp Text Copied', 'Message copied to your clipboard. You can paste it into any WhatsApp chat.', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  // Launch WhatsApp & track inquiry
  const handleLaunchWhatsApp = () => {
    // Record this inquiry in the platform so seller can see in their dashboard
    if (listing) {
      createInquiry({
        listingId: listing.id,
        partTitle: listing.title,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        buyerName: buyerName || 'WhatsApp Buyer',
        buyerPhone: buyerPhone || 'WhatsApp Direct',
        buyerEmail: 'whatsapp-direct@partsource.co.za',
        message: `[WhatsApp Direct Inquiry - ${intent.toUpperCase()}]: ${customMessage || 'Buyer initiated direct WhatsApp conversation for ' + listing.title}`,
        channel: 'whatsapp'
      });
    }

    setMessageSent(true);

    // Open WhatsApp in new tab/window
    window.open(waLink, '_blank', 'noopener,noreferrer');
    showNotification('WhatsApp Opened', `Connecting you directly with ${sellerName}...`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* WhatsApp Brand Top Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 border-b border-emerald-700/60 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                <MessageCircle className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 absolute bottom-0 right-0"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white tracking-tight">{sellerName}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-400/30">
                  Verified Supplier
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 flex items-center gap-2">
                <span className="font-mono">{rawWhatsApp}</span>
                <span>•</span>
                <span className="text-emerald-300">Online & Responding</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${sellerPhone}`}
              className="p-2 rounded-xl bg-emerald-700/40 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Call phone directly"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Call</span>
            </a>

            <button
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-700/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Screen (Left: Composer & Intent | Right: Live WhatsApp Bubble Preview) */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          
          {/* Selected Part Context Banner (if available) */}
          {listing && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {listing.make} {listing.model} ({listing.yearStart}–{listing.yearEnd})
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{listing.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono font-semibold text-slate-300">OEM: {listing.partNumber}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{listing.condition}</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <span className="text-lg font-black text-amber-400">{formatZAR(listing.priceZAR)}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  {listing.locationCity}, {listing.locationProvince}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Intent Selector & Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Step 1: Select What You Need (Intent Tabs) */}
              <div>
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Choose WhatsApp Inquiry Purpose</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {intentOptions.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = intent === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setIntent(opt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{opt.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{opt.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Context Input Customizer */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  2. Customize Your Details (Auto-Formatted)
                </label>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Your Name:</span>
                    <input
                      type="text"
                      placeholder="e.g. Johan van der Merwe / Sipho"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Your Phone / WhatsApp:</span>
                    <input
                      type="tel"
                      placeholder="e.g. 082 123 4567"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Intent-specific fields */}
                {(intent === 'vin_fitment' || intent === 'availability') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Your Vehicle (Make/Model/Year):</span>
                      <input
                        type="text"
                        placeholder="e.g. 2018 Toyota Hilux 2.8 GD-6 4x4"
                        value={buyerVehicle}
                        onChange={(e) => setBuyerVehicle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">VIN / Engine Number (Optional):</span>
                      <input
                        type="text"
                        placeholder="e.g. AHTBA3CD..."
                        value={buyerVin}
                        onChange={(e) => setBuyerVin(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {(intent === 'courier_quote' || intent === 'collection') && (
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block mb-1">
                      {intent === 'courier_quote' ? 'Delivery Destination Town / Suburb & Province:' : 'Your Location / Expected Pickup Date:'}
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Randburg, Gauteng / Pinetown, KZN / Polokwane"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Additional custom questions */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">Any specific question or request:</span>
                  <textarea
                    rows={2}
                    placeholder="e.g. Does this include the electronic actuator? Is the gearbox torque converter tested?"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* Safety & Anti-Scam Notice */}
              <div className="p-3 bg-slate-950 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-300">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Part Source Buyer Protection:</strong> Always verify part numbers, request fresh photos of stampings before paying, and insist on official invoices with company VAT / registration numbers.
                </div>
              </div>

            </div>

            {/* Right Column: Live WhatsApp Message Simulator (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Live Preview</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-normal">Encrypted Chat</span>
                </label>

                {/* WhatsApp Chat Container */}
                <div className="bg-[#0b141a] rounded-2xl border border-slate-800 p-3 shadow-inner relative overflow-hidden flex flex-col min-h-[290px]">
                  
                  {/* Subtle WhatsApp wallpaper pattern styling */}
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                  {/* Header stamp */}
                  <div className="text-center my-1 z-10">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#182229] text-[10px] text-slate-400 border border-white/5 font-sans">
                      Today • WhatsApp Direct with {sellerName}
                    </span>
                  </div>

                  {/* Outgoing WhatsApp Speech Bubble */}
                  <div className="my-2 max-w-[95%] self-end bg-[#005c4b] text-slate-100 p-3 rounded-2xl rounded-tr-none text-xs font-sans shadow-md border border-[#02735e]/50 z-10 whitespace-pre-wrap leading-relaxed font-normal">
                    {compiledMessage}

                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-emerald-200/70">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-sky-300 font-bold">✓✓</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                
                {/* Primary Launch WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleLaunchWhatsApp}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-slate-950" />
                  <span>Launch WhatsApp Chat Now</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>

                {/* Secondary Actions: Copy Text & Direct Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${sellerPhone}`}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 text-center"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Call Yard ({sellerPhone})</span>
                  </a>
                </div>

                {messageSent && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-600/40 rounded-xl text-center text-xs text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400 inline mr-1" />
                    Inquiry registered in your buyer history & transmitted to seller WhatsApp.
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
