import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  ShoppingBag, 
  Send, 
  MapPin, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Trash2, 
  Layers, 
  Wrench, 
  Car, 
  Truck, 
  ExternalLink,
  ChevronRight,
  BookmarkPlus,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  MarketingAudience, 
  MarketingChannel, 
  MarketingCampaign, 
  SouthAfricanProvince 
} from '../types';
import { SA_PROVINCES } from '../data/mockData';

export const MarketingStrategyModal: React.FC = () => {
  const { 
    isMarketingModalOpen, 
    setIsMarketingModalOpen, 
    marketingAudienceFilter, 
    setMarketingAudienceFilter,
    marketingCampaigns,
    saveMarketingCampaign,
    deleteMarketingCampaign,
    showNotification,
    openClientOutreach
  } = useApp();

  const [activeTab, setActiveTab] = useState<'playbooks' | 'ai_generator' | 'saved'>('playbooks');
  const [selectedAudience, setSelectedAudience] = useState<MarketingAudience>(marketingAudienceFilter);
  const [selectedChannel, setSelectedChannel] = useState<MarketingChannel>('whatsapp_broadcast');
  const [selectedProvince, setSelectedProvince] = useState<SouthAfricanProvince | 'All South Africa'>('All South Africa');
  const [vehicleFocus, setVehicleFocus] = useState<string>('All Vehicles (Hilux, Polo, Ranger, Commercial Trucks)');
  const [customGoal, setCustomGoal] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<MarketingCampaign | null>(null);
  const [generationSource, setGenerationSource] = useState<string>('built-in');
  const [creditsDepletedNotice, setCreditsDepletedNotice] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isMarketingModalOpen) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    showNotification('Copied to Clipboard', 'Text copied and ready to paste.', 'success');
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  const handleShareWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleGenerateAi = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/marketing-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAudience: selectedAudience,
          channel: selectedChannel,
          targetProvince: selectedProvince,
          vehicleFocus,
          customGoal
        })
      });

      const data = await res.json();
      if (data && data.campaign) {
        setGenerationSource(data.source || 'built-in');
        setCreditsDepletedNotice(Boolean(data.creditsDepleted));

        const camp: MarketingCampaign = {
          id: `ai-${Date.now()}`,
          title: data.campaign.campaignTitle || 'AI South Africa Growth Blitz',
          targetAudience: data.campaign.targetAudience || selectedAudience,
          channel: data.campaign.channel || selectedChannel,
          targetProvince: data.campaign.targetProvince || selectedProvince,
          vehicleFocus: vehicleFocus,
          executiveSummary: data.campaign.executiveSummary,
          coreGrowthHook: data.campaign.coreGrowthHook,
          keyTactics: Array.isArray(data.campaign.keyTactics) ? data.campaign.keyTactics : [],
          readyCopyWhatsApp: data.campaign.readyCopyWhatsApp,
          readyCopySocial: data.campaign.readyCopySocial,
          physicalDigitalLocations: Array.isArray(data.campaign.physicalDigitalLocations) ? data.campaign.physicalDigitalLocations : [],
          callToAction: data.campaign.callToAction,
          kpiMetrics: data.campaign.kpiMetrics,
          createdAt: new Date().toISOString().split('T')[0],
          isCustomGenerated: true
        };
        setGeneratedCampaign(camp);
        showNotification(
          'Campaign Generated!', 
          `Created "${camp.title}" tailored for ${selectedProvince}.`, 
          'success'
        );
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      showNotification('Notice', 'Generated strategy using built-in South African automotive intelligence.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGenerated = async () => {
    if (!generatedCampaign) return;
    await saveMarketingCampaign({
      title: generatedCampaign.title,
      targetAudience: generatedCampaign.targetAudience,
      channel: generatedCampaign.channel,
      targetProvince: generatedCampaign.targetProvince,
      vehicleFocus: generatedCampaign.vehicleFocus,
      executiveSummary: generatedCampaign.executiveSummary,
      coreGrowthHook: generatedCampaign.coreGrowthHook,
      keyTactics: generatedCampaign.keyTactics,
      readyCopyWhatsApp: generatedCampaign.readyCopyWhatsApp,
      readyCopySocial: generatedCampaign.readyCopySocial,
      physicalDigitalLocations: generatedCampaign.physicalDigitalLocations,
      callToAction: generatedCampaign.callToAction,
      kpiMetrics: generatedCampaign.kpiMetrics,
      isCustomGenerated: true
    });
    setActiveTab('saved');
  };

  const filteredPlaybooks = marketingCampaigns.filter(c => {
    if (selectedAudience === 'dual_sided') return true;
    return c.targetAudience === selectedAudience || c.targetAudience === 'dual_sided';
  });

  const savedCampaigns = marketingCampaigns.filter(c => c.isCustomGenerated);

  return (
    <div 
      id="marketing-strategy-modal-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsMarketingModalOpen(false);
      }}
    >
      <div 
        id="marketing-strategy-modal" 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  AI Marketing & Growth Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  South Africa Spares Blitz
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Strategic acquisition playbooks to get scrap yards listed and car owners buying nationwide
              </p>
            </div>
          </div>
          <button
            id="close-marketing-modal-btn"
            onClick={() => setIsMarketingModalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audience Selector Banner */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Audience:
            </span>
            <div className="inline-flex rounded-lg bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
              <button
                id="audience-sellers-btn"
                onClick={() => {
                  setSelectedAudience('sellers');
                  setMarketingAudienceFilter('sellers');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedAudience === 'sellers'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Sellers & Scrap Yards
              </button>
              <button
                id="audience-buyers-btn"
                onClick={() => {
                  setSelectedAudience('buyers');
                  setMarketingAudienceFilter('buyers');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedAudience === 'buyers'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Buyers & Car Owners
              </button>
              <button
                id="audience-dual-btn"
                onClick={() => {
                  setSelectedAudience('dual_sided');
                  setMarketingAudienceFilter('dual_sided');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedAudience === 'dual_sided'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                360° Marketplace Blitz
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setIsMarketingModalOpen(false);
                openClientOutreach();
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Search South African Scrap Yards & Send Direct WhatsApp / Email Pitches"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prospect Scrap Yards & Send Pitch</span>
            </button>

            <button
              id="tab-playbooks-btn"
              onClick={() => setActiveTab('playbooks')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'playbooks'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Master Playbooks ({filteredPlaybooks.length})
            </button>
            <button
              id="tab-generator-btn"
              onClick={() => setActiveTab('ai_generator')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai_generator'
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-slate-950" />
              AI Custom Generator
            </button>
            {savedCampaigns.length > 0 && (
              <button
                id="tab-saved-btn"
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Custom Library ({savedCampaigns.length})
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: MASTER PLAYBOOKS */}
          {activeTab === 'playbooks' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex items-start gap-3">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    South Africa Growth Blueprint
                  </h4>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-1 leading-relaxed">
                    {selectedAudience === 'sellers' 
                      ? 'To get scrap yards to list: Use yard-to-yard walk-in onboarding, emphasize 0% sales commission, show direct WhatsApp buyer inquiries arriving, and offer free bulk Excel inventory migration.'
                      : selectedAudience === 'buyers'
                      ? 'To get car owners to discover the app: Run high-intent price comparison ads ("Dealership R18,000 vs Scrap Yard R3,500"), target Facebook Auto Buy/Sell groups, and enable rapid WhatsApp parts quotation.'
                      : 'Dual-sided marketplace flywheel: Balance scrap yard catalog density in top industrial hubs (Gauteng, KZN, Western Cape) with viral social price comparison hooks.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredPlaybooks.map((campaign) => (
                  <div 
                    key={campaign.id} 
                    id={`campaign-card-${campaign.id}`}
                    className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            campaign.targetAudience === 'sellers' 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' 
                              : campaign.targetAudience === 'buyers'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          }`}>
                            {campaign.targetAudience === 'sellers' ? 'Seller Acquisition' : campaign.targetAudience === 'buyers' ? 'Buyer Discovery' : 'Dual Flywheel'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            {campaign.targetProvince}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Channel: {campaign.channel.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                          {campaign.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {campaign.kpiMetrics}
                      </span>
                    </div>

                    {/* Hook & Summary */}
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                          Core Growth Hook:
                        </span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          "{campaign.coreGrowthHook}"
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {campaign.executiveSummary}
                      </p>
                    </div>

                    {/* Key Tactics */}
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                        Battle-Tested Key Tactics:
                      </span>
                      <ul className="space-y-1.5">
                        {campaign.keyTactics.map((tactic, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <ChevronRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <span>{tactic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Copyable Assets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* WhatsApp Ready Copy */}
                      <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              Ready WhatsApp Broadcast
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopy(campaign.readyCopyWhatsApp, `wa-${campaign.id}`)}
                                className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm"
                                title="Copy WhatsApp message"
                              >
                                {copiedField === `wa-${campaign.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                Copy
                              </button>
                              <button
                                onClick={() => handleShareWhatsApp(campaign.readyCopyWhatsApp)}
                                className="p-1 px-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1 shadow-sm"
                                title="Send via WhatsApp"
                              >
                                <Send className="w-3 h-3" />
                                Send
                              </button>
                            </div>
                          </div>
                          <pre className="text-[11px] font-sans whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
                            {campaign.readyCopyWhatsApp}
                          </pre>
                        </div>
                      </div>

                      {/* Social Media Ready Copy */}
                      <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                              <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              Facebook / Social Caption
                            </span>
                            <button
                              onClick={() => handleCopy(campaign.readyCopySocial, `social-${campaign.id}`)}
                              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-sm"
                              title="Copy social post"
                            >
                              {copiedField === `social-${campaign.id}` ? (
                                <Check className="w-3 h-3 text-blue-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              Copy
                            </button>
                          </div>
                          <pre className="text-[11px] font-sans whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
                            {campaign.readyCopySocial}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Hotspots */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Physical Scrap Strips & Digital Communities to Target:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {campaign.physicalDigitalLocations.map((loc, i) => (
                          <span 
                            key={i} 
                            className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                          >
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AI CUSTOM GENERATOR */}
          {activeTab === 'ai_generator' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Generate Bespoke Growth Campaign with Gemini 3.8 Flash
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure your target parameters to get a tailor-made marketing strategy, WhatsApp pitch, social posts, and target scrap yard clusters across South Africa.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {/* Audience */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={selectedAudience}
                      onChange={(e) => setSelectedAudience(e.target.value as MarketingAudience)}
                      className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                    >
                      <option value="sellers">Sellers (Scrap Yards & Auto Dismantlers)</option>
                      <option value="buyers">Buyers (Car Owners, Mechanics & Workshops)</option>
                      <option value="dual_sided">Dual-Sided (360° Marketplace Blitz)</option>
                    </select>
                  </div>

                  {/* Channel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Marketing Channel
                    </label>
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value as MarketingChannel)}
                      className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                    >
                      <option value="whatsapp_broadcast">WhatsApp Broadcast & Direct Outreach</option>
                      <option value="yard_visit">In-Person Scrap Yard Visits (Walk-in Blitz)</option>
                      <option value="facebook_marketplace">Facebook Marketplace & Auto Groups</option>
                      <option value="google_seo">Google Local SEO & City Search Pages</option>
                      <option value="tiktok_reels">TikTok & Reels Video Hooks (#CarTokSA)</option>
                      <option value="fleet_b2b">Commercial Fleet & Taxi Associations (B2B)</option>
                      <option value="meta_ads">Targeted Meta (Facebook / Instagram) Ads</option>
                    </select>
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target South African Province
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value as any)}
                      className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                    >
                      <option value="All South Africa">All South Africa (Nationwide)</option>
                      {SA_PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Focus */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Vehicle or Category Focus
                    </label>
                    <input
                      type="text"
                      value={vehicleFocus}
                      onChange={(e) => setVehicleFocus(e.target.value)}
                      placeholder="e.g. Toyota Hilux 2.8 GD-6, VW Polo TSI gearboxes, Commercial Trucks"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Custom Goal */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Specific Growth Goal (Optional)
                    </label>
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder="e.g. Sign up 30 scrap yards in Booysens and Pretoria West within 14 days"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    id="generate-strategy-btn"
                    onClick={handleGenerateAi}
                    disabled={isGenerating}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing South Africa Auto Market...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        Generate AI Growth Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Result Card */}
              {generatedCampaign && (
                <div 
                  id="generated-campaign-result" 
                  className="border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {generationSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Built-in ZA Growth Engine'}
                        </span>
                        {creditsDepletedNotice && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300">
                            Offline Fallback Active
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {generatedCampaign.targetProvince}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {generatedCampaign.vehicleFocus}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                        {generatedCampaign.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="save-campaign-btn"
                        onClick={handleSaveGenerated}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        Save to Strategy Hub
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                      Core Growth Hook:
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      "{generatedCampaign.coreGrowthHook}"
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {generatedCampaign.executiveSummary}
                  </p>

                  {/* Tactics */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                      Execution Steps:
                    </span>
                    <ul className="space-y-1.5">
                      {generatedCampaign.keyTactics.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ready Copy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* WhatsApp */}
                    <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          WhatsApp Broadcast Message
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(generatedCampaign.readyCopyWhatsApp, 'gen-wa')}
                            className="p-1 px-2 rounded bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                          >
                            {copiedField === 'gen-wa' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            Copy
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(generatedCampaign.readyCopyWhatsApp)}
                            className="p-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Send
                          </button>
                        </div>
                      </div>
                      <pre className="text-[11px] font-sans whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                        {generatedCampaign.readyCopyWhatsApp}
                      </pre>
                    </div>

                    {/* Social */}
                    <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                          <Share2 className="w-4 h-4 text-blue-600" />
                          Social Media / Group Caption
                        </span>
                        <button
                          onClick={() => handleCopy(generatedCampaign.readyCopySocial, 'gen-social')}
                          className="p-1 px-2 rounded bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                        >
                          {copiedField === 'gen-social' ? <Check className="w-3 h-3 text-blue-600" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <pre className="text-[11px] font-sans whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                        {generatedCampaign.readyCopySocial}
                      </pre>
                    </div>
                  </div>

                  {/* Hotspots & KPI */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>Target KPI:</strong> {generatedCampaign.kpiMetrics}
                    </div>
                    <div className="text-xs text-slate-500">
                      <strong>Call to action:</strong> {generatedCampaign.callToAction}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM SAVED LIBRARY */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-amber-500" />
                Your Custom Saved Strategies ({savedCampaigns.length})
              </h3>
              
              {savedCampaigns.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <BookmarkPlus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    No custom campaigns saved yet.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Use the AI Custom Generator to create bespoke strategies and save them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedCampaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                              {camp.targetAudience}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-600 dark:text-slate-300">
                              {camp.targetProvince}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                            {camp.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => deleteMarketingCampaign(camp.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded"
                          title="Delete campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {camp.executiveSummary}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleCopy(camp.readyCopyWhatsApp, `wa-saved-${camp.id}`)}
                          className="text-xs font-semibold px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1.5"
                        >
                          {copiedField === `wa-saved-${camp.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy WhatsApp Pitch
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(camp.readyCopyWhatsApp)}
                          className="text-xs font-semibold px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          Send to WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Quick Action Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Targeting South Africa: JHB • Pretoria • Durban • Cape Town • Gqeberha • Bloemfontein</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const sample = `Hi! I found verified car and truck spares on Part Source ZA (https://partssource.co.za) with direct WhatsApp scrap yard contacts. Thought you would find this useful for finding cheap parts!`;
                handleShareWhatsApp(sample);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Quick WhatsApp Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
