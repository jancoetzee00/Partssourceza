import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  Search, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Download, 
  Printer, 
  MessageSquare, 
  Sparkles, 
  X, 
  Car, 
  Truck, 
  MapPin, 
  Layers, 
  Tag, 
  Eye, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  Code2, 
  Send,
  Building2,
  Sliders,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import QRCode from 'qrcode';
import { SA_PROVINCES, POPULAR_MAKES, POPULAR_MODELS_BY_MAKE, CATEGORIES } from '../data/mockData';

const POPULAR_SEARCH_PRESETS = [
  {
    title: 'Toyota Hilux GD-6 Engine & Spares',
    search: 'Toyota Hilux GD-6',
    make: 'Toyota',
    model: 'Hilux',
    category: 'Engine & Mechanical',
    province: 'Gauteng',
    tag: 'Bakkie #1'
  },
  {
    title: 'VW Polo TSI Gearbox & Clutch',
    search: 'VW Polo TSI Gearbox',
    make: 'Volkswagen',
    model: 'Polo',
    category: 'Gearbox & Drivetrain',
    province: 'Gauteng',
    tag: 'Popular Hatch'
  },
  {
    title: 'Ford Ranger 2.2 / 3.2 TDCi Parts',
    search: 'Ford Ranger TDCi Spares',
    make: 'Ford',
    model: 'Ranger',
    category: 'Engine & Mechanical',
    province: 'KwaZulu-Natal',
    tag: 'Bakkie Spares'
  },
  {
    title: 'Isuzu D-Max Suspension & Body Panels',
    search: 'Isuzu D-Max Spares',
    make: 'Isuzu',
    model: 'D-Max',
    category: 'Suspension & Steering',
    province: 'Eastern Cape',
    tag: 'Commercial'
  },
  {
    title: 'Commercial Truck Axles & Heavy Duty',
    search: 'Commercial Truck Heavy Duty Axle',
    make: 'Mercedes-Benz Commercial',
    model: 'Actros',
    category: 'Truck Heavy Duty Axles',
    province: 'Gauteng',
    tag: 'B2B Logistics'
  },
  {
    title: 'Johannesburg Scrap Yards Stock',
    search: '',
    make: '',
    model: '',
    category: '',
    province: 'Gauteng',
    tag: 'Gauteng Scrap Yards'
  },
  {
    title: 'Cape Town Western Cape Spares Directory',
    search: '',
    make: '',
    model: '',
    category: '',
    province: 'Western Cape',
    tag: 'Western Cape'
  },
  {
    title: 'BMW & Mercedes Stripping Spares',
    search: 'Stripping for spares',
    make: 'BMW',
    model: '3 Series',
    category: 'Body Panels & Bumpers',
    province: 'Gauteng',
    tag: 'German Spares'
  }
];

export const WebLinkShareModal: React.FC = () => {
  const { 
    isWebLinkModalOpen, 
    setIsWebLinkModalOpen, 
    webLinkModalData, 
    listings, 
    sellers,
    showNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'link-builder' | 'qr-code' | 'embed-widget' | 'seo-visibility'>('link-builder');
  const [selectedDomain, setSelectedDomain] = useState<'partssource.co.za' | 'partsource.co.za' | 'current'>('partssource.co.za');
  
  // Link Builder State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [customCampaign, setCustomCampaign] = useState('organic_search');

  // QR Code State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSize, setQrSize] = useState<number>(320);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize or prefill from modal data or active selection
  useEffect(() => {
    if (isWebLinkModalOpen) {
      if (webLinkModalData) {
        setSearchQuery(webLinkModalData.initialSearch || '');
        setSelectedMake(webLinkModalData.initialMake || '');
        setSelectedModel(webLinkModalData.initialModel || '');
        setSelectedCategory(webLinkModalData.initialCategory || '');
        setSelectedProvince(webLinkModalData.initialProvince || '');
        setSelectedPartId(webLinkModalData.initialPartId || '');
        setSelectedSellerId(webLinkModalData.initialSellerId || '');
      }
    }
  }, [isWebLinkModalOpen, webLinkModalData]);

  // Compute Base URL based on selected domain
  const getBaseDomainUrl = () => {
    if (selectedDomain === 'partssource.co.za') {
      return 'https://partssource.co.za';
    }
    if (selectedDomain === 'partsource.co.za') {
      return 'https://partsource.co.za';
    }
    return typeof window !== 'undefined' ? window.location.origin : 'https://partssource.co.za';
  };

  // Build the complete full query URL
  const buildWebLink = () => {
    const base = getBaseDomainUrl();
    const params = new URLSearchParams();

    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedProvince) params.set('province', selectedProvince);
    if (selectedVehicleType) params.set('type', selectedVehicleType);
    if (selectedPartId) params.set('part', selectedPartId);
    if (selectedSellerId) params.set('seller', selectedSellerId);
    if (customCampaign && customCampaign !== 'none') params.set('ref', customCampaign);

    const queryString = params.toString();
    return queryString ? `${base}/?${queryString}` : `${base}/`;
  };

  const currentWebLink = buildWebLink();

  // Generate QR Code when URL changes or tab changes
  useEffect(() => {
    if (isWebLinkModalOpen && currentWebLink) {
      QRCode.toDataURL(currentWebLink, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
    }
  }, [isWebLinkModalOpen, currentWebLink, qrSize]);

  if (!isWebLinkModalOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showNotification('Web Link Copied', 'Direct search link copied to clipboard.', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Preset search click handler
  const handleApplyPreset = (preset: typeof POPULAR_SEARCH_PRESETS[0]) => {
    setSearchQuery(preset.search);
    setSelectedMake(preset.make);
    setSelectedModel(preset.model);
    setSelectedCategory(preset.category);
    setSelectedProvince(preset.province);
    setSelectedPartId('');
    setSelectedSellerId('');
    showNotification('Search Preset Loaded', `Configured for ${preset.title}`, 'info');
  };

  // Reset link builder
  const handleReset = () => {
    setSearchQuery('');
    setSelectedMake('');
    setSelectedModel('');
    setSelectedCategory('');
    setSelectedProvince('');
    setSelectedVehicleType('');
    setSelectedPartId('');
    setSelectedSellerId('');
  };

  // Sharing handlers
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Part Source ZA - South Africa Auto Spares & Scrap Yards',
          text: searchQuery 
            ? `Find ${searchQuery} and verified scrap yard car & truck spares on Part Source ZA:` 
            : 'Search and compare car, bakkie, and commercial truck spares across South Africa on Part Source ZA:',
          url: currentWebLink
        });
        showNotification('Shared Successfully', 'Link shared via native device dialog.', 'success');
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      handleCopy(currentWebLink, 'web-link-main');
    }
  };

  const shareText = encodeURIComponent(
    `🔍 Search & Compare Car & Truck Spares on Part Source ZA (partssource.co.za)!\n\n` +
    (searchQuery ? `*Direct Search:* ${searchQuery}\n` : '') +
    (selectedProvince ? `*Province:* ${selectedProvince}\n` : '') +
    `Find verified scrap yards, OEM engines, gearboxes, and body parts with instant WhatsApp seller chat:\n${currentWebLink}`
  );

  const whatsAppShareUrl = `https://wa.me/?text=${shareText}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentWebLink)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Find car & truck spares across South Africa on Part Source ZA: `)}&url=${encodeURIComponent(currentWebLink)}&hashtags=CarPartsZA,PartSourceZA,SouthAfrica,ScrapYards`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent('Part Source ZA - Auto Parts & Scrap Yard Search Link')}&body=${shareText}`;
  const smsShareUrl = `sms:?body=${shareText}`;

  // Download QR Code image
  const handleDownloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const sanitizedTitle = (searchQuery || selectedMake || 'partssource-za').toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `partssource-za-qr-${sanitizedTitle}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification('QR Code Downloaded', 'High-res QR code image saved to your device.', 'success');
  };

  // Selected part details if partId selected
  const activeSelectedPart = listings.find(l => l.id === selectedPartId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  WEB LINK & SEARCH VISIBILITY HUB
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🇿🇦 partssource.co.za
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate instant copyable web links, search deep-links, QR codes, and multi-channel sharing to make your marketplace visible.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWebLinkModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Domain Switcher & Quick Copy Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800/80 px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Domain selector pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                Target Domain:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedDomain('partssource.co.za')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDomain === 'partssource.co.za'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  partssource.co.za ⭐
                </button>
                <button
                  onClick={() => setSelectedDomain('partsource.co.za')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDomain === 'partsource.co.za'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  partsource.co.za
                </button>
                <button
                  onClick={() => setSelectedDomain('current')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDomain === 'current'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title="Use current dev server URL"
                >
                  App Host URL
                </button>
              </div>
            </div>

            {/* Quick Share / Open Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleNativeShare}
                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share App Link</span>
              </button>
              <a
                href={currentWebLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Open URL</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-900 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('link-builder')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'link-builder'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Link Creator & Sharing</span>
          </button>

          <button
            onClick={() => setActiveTab('qr-code')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'qr-code'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Interactive QR Code & Print Flyer</span>
          </button>

          <button
            onClick={() => setActiveTab('embed-widget')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'embed-widget'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Website & Forum Search Embed</span>
          </button>

          <button
            onClick={() => setActiveTab('seo-visibility')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'seo-visibility'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Google Visibility & Indexing</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-slate-900/60">
          
          {/* TAB 1: SEARCH LINK CREATOR & MULTI-CHANNEL SHARING */}
          {activeTab === 'link-builder' && (
            <div className="space-y-6">
              
              {/* Live Web Link Banner Box */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-amber-500/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Generated Live Search URL
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Parameters Active: {[searchQuery, selectedMake, selectedModel, selectedCategory, selectedProvince, selectedPartId, selectedSellerId].filter(Boolean).length}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 break-all select-all flex items-center justify-between">
                    <span className="truncate">{currentWebLink}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(currentWebLink, 'web-link-main')}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap"
                  >
                    {copiedKey === 'web-link-main' ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>COPIED TO CLIPBOARD!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-950" />
                        <span>COPY WEB LINK</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Multi-Channel Share Buttons */}
                <div className="pt-2 border-t border-slate-800/80">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Share Link Directly:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    
                    {/* WhatsApp */}
                    <a
                      href={whatsAppShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm group"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Facebook */}
                    <a
                      href={facebookShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm group"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span>Facebook</span>
                    </a>

                    {/* Twitter / X */}
                    <a
                      href={twitterShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm group"
                    >
                      <span className="font-mono text-sm leading-none">𝕏</span>
                      <span>X Post</span>
                    </a>

                    {/* Email */}
                    <a
                      href={emailShareUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Email</span>
                    </a>

                    {/* SMS */}
                    <a
                      href={smsShareUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>SMS</span>
                    </a>

                    {/* Native Device Share */}
                    <button
                      onClick={handleNativeShare}
                      className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>More...</span>
                    </button>

                  </div>
                </div>
              </div>

              {/* Popular 1-Click Search Presets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Popular South African Search Presets (1-Click Load)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Click any preset to pre-fill URL parameters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {POPULAR_SEARCH_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                          {preset.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{preset.province} • {preset.category || 'All Categories'}</span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Search Link Builder Form */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      Custom Search Link Builder
                    </h3>
                    <p className="text-xs text-slate-400">
                      Refine keywords, vehicle fitment, province, or deep-link to a specific part or scrap yard.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-amber-400 transition-colors font-medium"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Search Query */}
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Search className="w-3.5 h-3.5 text-amber-400" />
                      Search Keywords (OEM / Part Title)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hilux GD6 engine, Polo TSI gearbox..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Make */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                      Vehicle Make
                    </label>
                    <select
                      value={selectedMake}
                      onChange={(e) => {
                        setSelectedMake(e.target.value);
                        setSelectedModel('');
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">All Vehicle Makes</option>
                      {POPULAR_MAKES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      placeholder={selectedMake ? `e.g. ${POPULAR_MODELS_BY_MAKE[selectedMake]?.[0] || 'Model'}` : 'Type vehicle model...'}
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Part Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">All Part Categories</option>
                      {CATEGORIES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Province */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      South African Province
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">All 9 Provinces (Nationwide)</option>
                      {SA_PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      Vehicle Type
                    </label>
                    <select
                      value={selectedVehicleType}
                      onChange={(e) => setSelectedVehicleType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">All Vehicles & Trucks</option>
                      <option value="bakkie">Bakkie / Double Cab</option>
                      <option value="car">Passenger Car</option>
                      <option value="suv">SUV / Crossover</option>
                      <option value="truck">Commercial Truck</option>
                    </select>
                  </div>

                  {/* Deep-Link Direct Part Selector */}
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      Direct Part Deep-Link (Opens Part Detail Directly)
                    </label>
                    <select
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">None (Search Overview)</option>
                      {listings.slice(0, 30).map(item => (
                        <option key={item.id} value={item.id}>
                          {item.title} — R{item.priceZAR.toLocaleString()} ({item.locationCity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Deep-Link Direct Seller Storefront */}
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      Seller Scrap Yard Storefront Link
                    </label>
                    <select
                      value={selectedSellerId}
                      onChange={(e) => setSelectedSellerId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">All Verified Sellers</option>
                      {sellers.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.businessName} ({s.locationCity})
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE QR CODE & PRINT FLYER */}
          {activeTab === 'qr-code' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* QR Code Preview Card */}
              <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-amber-500/40">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Part Source ZA Search QR Code"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-black text-white">
                    Scan to Open Part Source ZA
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm font-mono break-all">
                    {currentWebLink}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleDownloadQrCode}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleCopy(currentWebLink, 'qr-url-copy')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>{copiedKey === 'qr-url-copy' ? 'Copied URL!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Flyer Use-Cases & Instructions */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-amber-400" />
                    Physical Shop & Workshop Deployment
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Print this QR code to place on your workshop counter, mechanic invoices, scrap yard bin tags, or vehicle windscreen stickers. When customers scan it with their phone camera, it opens Part Source ZA directly.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Scrap Yard Front Desk:</strong> Instant inventory catalog access for walk-in buyers.</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Mechanic Invoices & Quotes:</strong> Customers scan to find matching replacement spares.</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Bumper & Windscreen Stickers:</strong> Drives direct mobile traffic to <code>partssource.co.za</code>.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider text-slate-400">
                    QR Sizing Selection
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { size: 240, label: 'Small (240px)', desc: 'Business Cards' },
                      { size: 360, label: 'Medium (360px)', desc: 'Invoices & A5' },
                      { size: 600, label: 'Large (600px)', desc: 'Counter Posters' }
                    ].map((item) => (
                      <button
                        key={item.size}
                        onClick={() => setQrSize(item.size)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          qrSize === item.size
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: WEBSITE & FORUM SEARCH EMBED */}
          {activeTab === 'embed-widget' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    Embeddable HTML Search Badge Snippet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Paste this snippet onto mechanic websites, auto blogs, 4x4 community forums, or classified listings to drive direct search traffic.
                  </p>
                </div>

                {/* HTML Badge Code */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">HTML Anchor & Badge Code:</span>
                    <button
                      onClick={() => handleCopy(
                        `<a href="${currentWebLink}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background-color:#0f172a;color:#f59e0b;border:1px solid #f59e0b;border-radius:10px;font-family:sans-serif;font-weight:bold;text-decoration:none;font-size:13px;">🔍 Search Spares on Part Source ZA</a>`,
                        'embed-badge-html'
                      )}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedKey === 'embed-badge-html' ? 'Copied HTML!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto select-all">
{`<a href="${currentWebLink}" target="_blank" rel="noopener noreferrer" 
   style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background-color:#0f172a;color:#f59e0b;border:1px solid #f59e0b;border-radius:10px;font-family:sans-serif;font-weight:bold;text-decoration:none;font-size:13px;">
  🔍 Search Auto Spares on Part Source ZA
</a>`}
                  </pre>
                </div>

                {/* Live Visual Preview of Badge */}
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Visual Preview:
                  </p>
                  <div>
                    <a
                      href={currentWebLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-amber-400 border border-amber-500/60 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-transform"
                    >
                      <Search className="w-4 h-4 text-amber-400" />
                      <span>Search Auto Spares on Part Source ZA (partssource.co.za)</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-1" />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE VISIBILITY & INDEXING */}
          {activeTab === 'seo-visibility' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Google Search Engine Indexing Status
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Check index status for <strong>partssource.co.za</strong> and submit sitemaps to Google Search Console and Bing.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href="https://www.google.com/search?q=site%3Apartssource.co.za"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">
                        Check Google Index (site:partssource.co.za)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Test live indexed pages and cached listings on Google.
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                  </a>

                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                        Google Search Console Hub
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Submit XML sitemap & verify domain ownership for partssource.co.za.
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                  </a>
                </div>

                {/* WhatsApp & Social OpenGraph Card Preview */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">
                    WhatsApp & Social Media Link Preview Card:
                  </h4>
                  <div className="max-w-md bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <img
                      src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
                      alt="Part Source ZA SEO Preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-3.5 space-y-1">
                      <p className="text-[10px] text-slate-400 font-mono uppercase">partssource.co.za</p>
                      <h5 className="text-xs font-black text-white">
                        Part Source ZA - South Africa Car & Truck Parts Marketplace
                      </h5>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Find genuine & used car, bakkie and commercial truck parts across South Africa. Direct WhatsApp chat with verified scrap yards in Johannesburg, Cape Town & Durban.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Official marketplace link: <strong>partssource.co.za</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(currentWebLink, 'web-link-footer')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedKey === 'web-link-footer' ? 'COPIED!' : 'COPY WEB LINK'}</span>
            </button>

            <button
              onClick={() => setIsWebLinkModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
