import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Check, 
  Copy, 
  Trash2, 
  UserPlus, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  Flame, 
  Wrench, 
  Car, 
  Truck, 
  ExternalLink, 
  SlidersHorizontal, 
  Users, 
  DollarSign, 
  Calendar,
  Layers,
  ChevronDown,
  History,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  ProspectiveClient, 
  ClientArchetype, 
  ClientOutreachStatus, 
  SouthAfricanProvince, 
  SellerTier 
} from '../types';
import { SA_PROVINCES } from '../data/mockData';
import { ProvinceCityDirectory } from './ProvinceCityDirectory';
import { ContactHistoryLog } from './ContactHistoryLog';

const ARCHETYPE_LABELS: Record<ClientArchetype, { label: string; icon: string; color: string }> = {
  scrap_yard: { label: 'Scrap Yard & Salvage', icon: '🏗️', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  auto_dismantler: { label: 'Auto Dismantler', icon: '🔧', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  part_store: { label: 'Auto Parts Store / Spares Retailer', icon: '🏪', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  engine_importer: { label: 'Engine & Gearbox Importer', icon: '⚙️', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  panel_beater: { label: 'Panel Beater & Collision', icon: '🔨', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  workshop_mechanic: { label: 'RMI / Independent Workshop', icon: '🧰', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  commercial_fleet: { label: 'Commercial Fleet / Trucks', icon: '🚛', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  taxi_association: { label: 'Taxi Association (SANTACO)', icon: '🚐', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' }
};

const STATUS_CONFIG: Record<ClientOutreachStatus, { label: string; color: string; badge: string }> = {
  pending: { label: 'Ready to Send', color: 'text-slate-400', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
  sent: { label: 'Outreach Sent', color: 'text-blue-400', badge: 'bg-blue-950/60 text-blue-300 border-blue-600/40' },
  responded: { label: 'In Conversation', color: 'text-amber-400', badge: 'bg-amber-950/60 text-amber-300 border-amber-600/40' },
  subscribed: { label: 'Subscribed 🎉', color: 'text-emerald-400', badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50' },
  declined: { label: 'Declined', color: 'text-red-400', badge: 'bg-red-950/60 text-red-300 border-red-800/40' }
};

export const ClientOutreachModal: React.FC = () => {
  const { 
    isClientOutreachModalOpen, 
    setIsClientOutreachModalOpen, 
    prospectiveClients, 
    addProspectiveClients, 
    updateClientStatus, 
    deleteProspectiveClient, 
    addManualClient,
    convertClientToSeller,
    purgeMockSellers,
    showNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'directory' | 'history' | 'search' | 'pipeline' | 'manual'>('directory');
  
  // Search Form State
  const [searchArchetype, setSearchArchetype] = useState<string>('all');
  const [searchProvince, setSearchProvince] = useState<SouthAfricanProvince | 'All South Africa'>('All South Africa');
  const [searchCityHub, setSearchCityHub] = useState<string>('');
  const [searchVehicleFocus, setSearchVehicleFocus] = useState<string>('All Vehicles (Hilux, Ranger, Polo, Commercial)');
  const [searchTier, setSearchTier] = useState<string>('all');
  const [searchCount, setSearchCount] = useState<number>(5);
  const [customSearchPrompt, setCustomSearchPrompt] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string>('');

  // Pipeline Filter State
  const [pipelineSearch, setPipelineSearch] = useState<string>('');
  const [pipelineArchetypeFilter, setPipelineArchetypeFilter] = useState<string>('all');
  const [pipelineProvinceFilter, setPipelineProvinceFilter] = useState<string>('all');
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState<string>('all');

  // Expanded client message card
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [messageChannelTab, setMessageChannelTab] = useState<'whatsapp' | 'email'>('whatsapp');
  const [messageTone, setMessageTone] = useState<'free_trial' | 'urgent_leads' | 'high_roi' | 'friendly_intro'>('free_trial');
  const [promoCode, setPromoCode] = useState<string>('ZAYARD14');
  const [isTailoring, setIsTailoring] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Manual Lead Form
  const [manualForm, setManualForm] = useState({
    businessName: '',
    archetype: 'scrap_yard' as ClientArchetype,
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: 'Johannesburg',
    province: 'Gauteng' as SouthAfricanProvince,
    industrialHub: 'Booysens',
    vehicleSpecialty: 'Toyota Hilux & Fortuner Spares',
    recommendedTier: 'pro' as SellerTier,
    potentialMonthlyZAR: 699,
    pitchHook: 'List your yard stock on Part Source ZA with 0% sales commission.'
  });

  if (!isClientOutreachModalOpen) return null;

  // Stats
  const totalLeads = prospectiveClients.length;
  const sentCount = prospectiveClients.filter(c => c.status === 'sent' || c.status === 'responded' || c.status === 'subscribed').length;
  const subscribedCount = prospectiveClients.filter(c => c.status === 'subscribed').length;
  const totalPotentialZAR = prospectiveClients.reduce((acc, c) => acc + (c.potentialMonthlyZAR || 0), 0);

  // Filtered Leads in Pipeline
  const filteredClients = prospectiveClients.filter(c => {
    if (pipelineSearch) {
      const q = pipelineSearch.toLowerCase();
      const matchName = c.businessName.toLowerCase().includes(q);
      const matchContact = c.contactPerson.toLowerCase().includes(q);
      const matchSpecialty = c.vehicleSpecialty.toLowerCase().includes(q);
      const matchHub = c.industrialHub.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
      if (!matchName && !matchContact && !matchSpecialty && !matchHub) return false;
    }
    if (pipelineArchetypeFilter !== 'all' && c.archetype !== pipelineArchetypeFilter) return false;
    if (pipelineProvinceFilter !== 'all' && c.province !== pipelineProvinceFilter) return false;
    if (pipelineStatusFilter !== 'all' && c.status !== pipelineStatusFilter) return false;
    return true;
  });

  const handleRunAiSearch = async (presetPrompt?: string) => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/prospect-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archetype: searchArchetype,
          province: searchProvince,
          cityHub: searchCityHub,
          vehicleFocus: searchVehicleFocus,
          targetTier: searchTier,
          count: searchCount,
          customPrompt: presetPrompt || customSearchPrompt
        })
      });

      const data = await res.json();
      if (data && data.clients && data.clients.length > 0) {
        setAiSource(data.source || 'gemini-3.8-flash');
        addProspectiveClients(data.clients);
        setActiveTab('pipeline');
        showNotification(
          'Prospecting Complete!', 
          `Discovered ${data.clients.length} prospective automotive clients with ready WhatsApp messages.`, 
          'success'
        );
      } else {
        showNotification('Search Finished', 'No new clients returned for the selected criteria.', 'info');
      }
    } catch (err: any) {
      console.error('Error running AI search:', err);
      showNotification('Search Error', 'Unable to complete prospecting request. Please retry.', 'warning');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showNotification('Copied', 'Message text copied to clipboard.', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSendWhatsApp = (client: ProspectiveClient, customMsg?: string) => {
    const textToSend = customMsg || client.personalizedMessageWhatsApp;
    const cleanPhone = client.whatsapp.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(textToSend);
    
    // If phone number is valid ZA format, direct wa.me/<phone>?text=...
    const url = cleanPhone.length >= 9 
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
    updateClientStatus(client.id, 'sent');
    showNotification('WhatsApp Opened', `Opened chat for ${client.businessName}. Marked as sent.`, 'success');
  };

  const handleSendEmail = (client: ProspectiveClient, customMsg?: string) => {
    const rawBody = customMsg || client.personalizedMessageEmail;
    // Extract subject line if present
    const subjectMatch = rawBody.match(/^Subject:\s*(.*?)(?:\n|$)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : `Exclusive Supplier Invitation: ${client.businessName} on Part Source ZA`;
    const bodyText = rawBody.replace(/^Subject:.*?\n+/i, '').trim();

    const mailto = `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailto;
    updateClientStatus(client.id, 'sent');
    showNotification('Email Client Opened', `Composing email to ${client.email}. Marked as sent.`, 'info');
  };

  const handleTailorMessage = async (client: ProspectiveClient) => {
    setIsTailoring(true);
    try {
      const res = await fetch('/api/ai/tailor-client-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client,
          tone: messageTone,
          customPromoCode: promoCode,
          channel: messageChannelTab
        })
      });
      const data = await res.json();
      if (data && data.tailoredMessage) {
        if (messageChannelTab === 'whatsapp') {
          client.personalizedMessageWhatsApp = data.tailoredMessage;
        } else {
          client.personalizedMessageEmail = data.tailoredMessage;
        }
        showNotification('Message Tailored', `Message rewritten in "${messageTone.replace('_', ' ')}" tone.`, 'success');
      }
    } catch (err) {
      console.error(err);
      showNotification('Tailor Error', 'Failed to rewrite message.', 'warning');
    } finally {
      setIsTailoring(false);
    }
  };

  const handleAddManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.businessName.trim()) {
      showNotification('Required', 'Please enter a business name.', 'warning');
      return;
    }

    const wa = `🚗 *Hi ${manualForm.contactPerson || 'there'}, greeting from Part Source ZA!* 🇿🇦\n\nWe noticed *${manualForm.businessName}* in *${manualForm.industrialHub}, ${manualForm.city}* specializes in *${manualForm.vehicleSpecialty}*.\n\nWe invite you to join Part Source ZA with a 14-day free trial (use voucher: *${promoCode}*):\n✅ Direct WhatsApp buyer inquiries\n✅ 0% commission on parts sales\n✅ Bulk upload your inventory from Excel\n\n👉 *Activate your profile:* https://partssource.co.za/?role=seller`;

    const em = `Subject: Verified Supplier Invitation for ${manualForm.businessName}\n\nDear ${manualForm.contactPerson || 'Sir/Madam'},\n\nPart Source ZA (partssource.co.za) is South Africa's dedicated auto spares marketplace. We would like to invite ${manualForm.businessName} to join our network of verified suppliers in ${manualForm.province}.\n\nActivate your 14-day trial here: https://partssource.co.za/?role=seller (Promo Code: ${promoCode})\n\nWarm regards,\nPart Source ZA`;

    addManualClient({
      ...manualForm,
      personalizedMessageWhatsApp: wa,
      personalizedMessageEmail: em
    });

    setActiveTab('pipeline');
    setManualForm({
      businessName: '',
      archetype: 'scrap_yard',
      contactPerson: '',
      phone: '',
      whatsapp: '',
      email: '',
      city: 'Johannesburg',
      province: 'Gauteng',
      industrialHub: 'Booysens',
      vehicleSpecialty: 'Toyota Hilux & Fortuner Spares',
      recommendedTier: 'pro',
      potentialMonthlyZAR: 699,
      pitchHook: 'List your yard stock on Part Source ZA with 0% sales commission.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  AI Client Discovery & Subscriber Outreach
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest hidden sm:inline-flex">
                  GEMINI 3.8 FLASH
                </span>
                <span className="text-xs">🇿🇦</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Search South African automotive scrap yards, dismantlers & workshops to subscribe & dispatch instant WhatsApp/Email pitches.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsClientOutreachModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 px-4 sm:px-6 py-3 bg-slate-950/70 border-b border-slate-800 text-xs">
          <button 
            onClick={() => setActiveTab('directory')}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900 transition-colors text-left"
            title="View South African Directory"
          >
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Discovered Leads</span>
              <span className="font-bold text-white text-sm">{totalLeads} Clients</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900 transition-colors text-left group"
            title="Open Contact History Log"
          >
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block group-hover:text-amber-400 transition-colors">Contact History Log</span>
              <span className="font-bold text-blue-400 text-sm">{sentCount + subscribedCount} Contacted</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900 transition-colors text-left"
            title="View Active Subscribers in Contact History"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Subscribers</span>
              <span className="font-bold text-emerald-400 text-sm">{subscribedCount} Subscribed</span>
            </div>
          </button>

          <div className="flex items-center gap-2.5 p-1">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Potential Monthly ARR</span>
              <span className="font-bold text-purple-300 text-sm">R{totalPotentialZAR.toLocaleString()} / mo</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          <div className="flex items-center gap-2 py-2 min-w-max">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>SA Directory: Scrap Yards & Part Stores ({totalLeads})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Contact History Log ({sentCount + subscribedCount}/{totalLeads})</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'search'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Search Clients</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'pipeline'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Client Pipeline & Messages ({totalLeads})</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'manual'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Custom Lead</span>
              <span className="sm:hidden">+ Lead</span>
            </button>
          </div>

          {activeTab === 'pipeline' && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>{filteredClients.length} filtered</span>
            </div>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 0: SA DIRECTORY (SCRAP YARDS & PART STORES BY PROVINCE & CITY) */}
          {activeTab === 'directory' && (
            <ProvinceCityDirectory 
              onSelectClientForPitch={(client) => {
                setSelectedClientId(client.id);
                setActiveTab('pipeline');
              }}
            />
          )}

          {/* TAB 0.5: CONTACT HISTORY LOG (TRACKS LAST CONTACT DATE, METHOD & STATUS FOR EVERY YARD & STORE) */}
          {activeTab === 'history' && (
            <ContactHistoryLog
              onSelectClientForPitch={(client) => {
                setSelectedClientId(client.id);
                setActiveTab('pipeline');
              }}
            />
          )}

          {/* TAB 1: AI SEARCH CLIENTS */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              
              {/* Quick AI Presets Banner */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 p-4 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Popular South African Prospecting Presets
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">Click any 1-click strategy to generate</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      setSearchArchetype('scrap_yard');
                      setSearchProvince('Gauteng');
                      setSearchCityHub('Booysens & Pretoria West');
                      setSearchVehicleFocus('Toyota Hilux, Fortuner & Quantum');
                      setSearchTier('pro');
                      handleRunAiSearch('Find premier Toyota and Bakkie scrap yards in Booysens and Pretoria West to subscribe to Part Source ZA Pro tier');
                    }}
                    disabled={isSearching}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-500/10 border border-slate-700/80 hover:border-amber-500/50 text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                      <span>🛻 Toyota & Hilux Yards</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Booysens / Pretoria West • Pro R699</div>
                  </button>

                  <button
                    onClick={() => {
                      setSearchArchetype('auto_dismantler');
                      setSearchProvince('Gauteng');
                      setSearchCityHub('Mayfair & Hermanstad');
                      setSearchVehicleFocus('VW Polo, Golf GTI, Audi & BMW');
                      setSearchTier('enterprise');
                      handleRunAiSearch('Find German auto dismantlers in Mayfair and Hermanstad to subscribe to Enterprise tier');
                    }}
                    disabled={isSearching}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-500/10 border border-slate-700/80 hover:border-amber-500/50 text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                      <span>🇩🇪 German Dismantlers</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Gauteng • VW, Audi, BMW • Enterprise</div>
                  </button>

                  <button
                    onClick={() => {
                      setSearchArchetype('engine_importer');
                      setSearchProvince('KwaZulu-Natal');
                      setSearchCityHub('Clairwood & Springfield');
                      setSearchVehicleFocus('Low-Mileage Japanese Import Engines (D4D, 1KZ, V9X)');
                      setSearchTier('pro');
                      handleRunAiSearch('Find Japanese engine and gearbox importers in Durban Clairwood to subscribe to Part Source ZA');
                    }}
                    disabled={isSearching}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-500/10 border border-slate-700/80 hover:border-amber-500/50 text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                      <span>⚙️ Durban Engine Importers</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Clairwood / Springfield • Pro R699</div>
                  </button>

                  <button
                    onClick={() => {
                      setSearchArchetype('commercial_fleet');
                      setSearchProvince('Western Cape');
                      setSearchCityHub('Stikland & Philippi');
                      setSearchVehicleFocus('Commercial Bakkies, Isuzu D-Max & Heavy Fleets');
                      setSearchTier('enterprise');
                      handleRunAiSearch('Find commercial vehicle dismantlers and fleet workshops in Cape Town Stikland to subscribe to Enterprise tier');
                    }}
                    disabled={isSearching}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-500/10 border border-slate-700/80 hover:border-amber-500/50 text-left transition-all text-xs group"
                  >
                    <div className="font-bold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                      <span>🚛 Cape Commercial Fleets</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Stikland & Philippi • Enterprise R1,499</div>
                  </button>
                </div>
              </div>

              {/* Custom Search Builder */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    Custom Client Search Parameters
                  </h4>
                  <span className="text-[11px] text-slate-400">Target exact yards, workshops & importers</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  
                  {/* Archetype */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Client Archetype</label>
                    <select
                      value={searchArchetype}
                      onChange={(e) => setSearchArchetype(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Automotive Businesses</option>
                      <option value="scrap_yard">Auto Scrap Yards & Salvage</option>
                      <option value="part_store">Auto Parts Stores & Spares Retailers</option>
                      <option value="auto_dismantler">Auto Dismantlers & Strippers</option>
                      <option value="engine_importer">Engine & Gearbox Importers</option>
                      <option value="panel_beater">Panel Beaters & Collision Centres</option>
                      <option value="workshop_mechanic">RMI Workshops & Mechanics</option>
                      <option value="commercial_fleet">Commercial Fleet & Truck Spares</option>
                      <option value="taxi_association">Taxi Associations (Minibus / Quantum)</option>
                    </select>
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Target Province</label>
                    <select
                      value={searchProvince}
                      onChange={(e) => setSearchProvince(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="All South Africa">All South Africa (Nationwide)</option>
                      {SA_PROVINCES.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Industrial Hub / Suburb */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Industrial Hub / Area (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Booysens, Clairwood, Stikland, Korsten..."
                      value={searchCityHub}
                      onChange={(e) => setSearchCityHub(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Vehicle Brand Specialization */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Vehicle Specialty</label>
                    <input
                      type="text"
                      placeholder="e.g. Toyota Hilux, VW Polo, Ford Ranger, Scania..."
                      value={searchVehicleFocus}
                      onChange={(e) => setSearchVehicleFocus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Target Plan Tier */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Recommended Subscription Tier</label>
                    <select
                      value={searchTier}
                      onChange={(e) => setSearchTier(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">AI Recommended Tier</option>
                      <option value="starter">Starter Plan (R299/mo)</option>
                      <option value="pro">Pro Plan (R699/mo) — Most Popular</option>
                      <option value="enterprise">Enterprise Plan (R1,499/mo)</option>
                    </select>
                  </div>

                  {/* Count */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1.5">Number of Clients to Discover</label>
                    <select
                      value={searchCount}
                      onChange={(e) => setSearchCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value={3}>3 Prospective Clients</option>
                      <option value={5}>5 Prospective Clients (Recommended)</option>
                      <option value={8}>8 Prospective Clients (Broad Scan)</option>
                    </select>
                  </div>
                </div>

                {/* Optional Custom Prompt Guidance */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">
                    Custom Prompt or Specific Goal (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Focus on scrap yards that strip commercial bakkies and offer gearboxes with 30-day warranty..."
                    value={customSearchPrompt}
                    onChange={(e) => setCustomSearchPrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Automatically drafts tailored WhatsApp and Email messages with 14-day free trial code (ZAYARD14).</span>
                  </div>

                  <button
                    onClick={() => handleRunAiSearch()}
                    disabled={isSearching}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Searching SA Automotive Yards & Workshops...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>AI Search Prospective Clients</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PIPELINE & MESSAGING */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              
              {/* Pipeline Filters Bar */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-1 min-w-[220px] items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700/80">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search business, contact, vehicle, suburb..."
                    value={pipelineSearch}
                    onChange={(e) => setPipelineSearch(e.target.value)}
                    className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder-slate-500"
                  />
                  {pipelineSearch && (
                    <button onClick={() => setPipelineSearch('')} className="text-slate-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filter */}
                  <select
                    value={pipelineStatusFilter}
                    onChange={(e) => setPipelineStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Ready to Send</option>
                    <option value="sent">Outreach Sent</option>
                    <option value="responded">In Conversation</option>
                    <option value="subscribed">Subscribed 🎉</option>
                    <option value="declined">Declined</option>
                  </select>

                  {/* Archetype Filter */}
                  <select
                    value={pipelineArchetypeFilter}
                    onChange={(e) => setPipelineArchetypeFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="all">All Archetypes</option>
                    <option value="scrap_yard">Scrap Yards</option>
                    <option value="part_store">Auto Parts Stores</option>
                    <option value="auto_dismantler">Auto Dismantlers</option>
                    <option value="engine_importer">Engine Importers</option>
                    <option value="panel_beater">Panel Beaters</option>
                    <option value="workshop_mechanic">Workshops</option>
                    <option value="commercial_fleet">Commercial Fleet</option>
                  </select>

                  {/* Province Filter */}
                  <select
                    value={pipelineProvinceFilter}
                    onChange={(e) => setPipelineProvinceFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="all">All Provinces</option>
                    {SA_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Roster / Cards Grid */}
              {filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 p-8">
                  <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-300">No prospective clients match the filter</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try switching filters or run a new search with the AI Client Search tool.
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors"
                  >
                    Search Clients with AI
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredClients.map((client) => {
                    const archConfig = ARCHETYPE_LABELS[client.archetype] || ARCHETYPE_LABELS.scrap_yard;
                    const statusConfig = STATUS_CONFIG[client.status] || STATUS_CONFIG.pending;
                    const isExpanded = selectedClientId === client.id;

                    return (
                      <div 
                        key={client.id}
                        className={`bg-slate-900/90 border rounded-2xl transition-all ${
                          isExpanded 
                            ? 'border-amber-500/60 shadow-xl shadow-amber-500/10' 
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Top Header Card */}
                        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          
                          {/* Business Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base">{archConfig.icon}</span>
                              <h4 className="font-extrabold text-white text-sm sm:text-base">
                                {client.businessName}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${archConfig.color}`}>
                                {archConfig.label}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badge}`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            {/* Details Strip */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Users className="w-3.5 h-3.5 text-amber-400" />
                                {client.contactPerson}
                              </span>

                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-red-400" />
                                {client.industrialHub}, {client.city} ({client.province})
                              </span>

                              <span className="flex items-center gap-1">
                                <Car className="w-3.5 h-3.5 text-blue-400" />
                                <strong className="text-slate-300 font-semibold">{client.vehicleSpecialty}</strong>
                              </span>

                              <span className="flex items-center gap-1 text-purple-300 font-semibold">
                                <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                                Rec. Plan: {client.recommendedTier.toUpperCase()} (R{client.potentialMonthlyZAR}/mo)
                              </span>
                            </div>

                            {/* Pitch Hook */}
                            <div className="bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-amber-200/90 flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{client.pitchHook}</span>
                            </div>

                            {/* Contact History Metadata */}
                            {client.lastContactedAt && client.status !== 'pending' ? (
                              <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Last contacted: {new Date(client.lastContactedAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </span>
                                <span className="text-slate-600">•</span>
                                <span>Method: <strong className="text-slate-200 uppercase">{client.contactMethod || 'whatsapp'}</strong></span>
                                {client.contactHistory && client.contactHistory.length > 0 && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <button
                                      onClick={() => setActiveTab('history')}
                                      className="text-amber-400 hover:underline inline-flex items-center gap-1 font-bold"
                                    >
                                      <History className="w-3 h-3" />
                                      <span>{client.contactHistory.length} contact log{client.contactHistory.length > 1 ? 's' : ''}</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                                <Clock className="w-3 h-3 text-slate-600" />
                                <span>Never contacted (Pending first outreach)</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons & Status Selector */}
                          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                            
                            <div className="flex items-center gap-2 w-full lg:w-auto">
                              {/* 1-Click WhatsApp Button */}
                              <button
                                onClick={() => handleSendWhatsApp(client)}
                                className="flex-1 lg:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all cursor-pointer"
                                title="Open WhatsApp with pre-filled message"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>

                              {/* 1-Click Email Button */}
                              <button
                                onClick={() => handleSendEmail(client)}
                                className="flex-1 lg:flex-initial px-3.5 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                                title="Send Email pitch"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Email</span>
                              </button>

                              {/* Quick Onboard to Live Supplier Registry */}
                              <button
                                onClick={() => convertClientToSeller(client, client.recommendedTier)}
                                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                title="Onboard this real business directly as an active platform supplier"
                              >
                                <Building2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Onboard Yard</span>
                              </button>
                            </div>

                            {/* Status Changer & Message Toggle */}
                            <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
                              <select
                                value={client.status}
                                onChange={(e) => updateClientStatus(client.id, e.target.value as ClientOutreachStatus)}
                                className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                              >
                                <option value="pending">Status: Ready</option>
                                <option value="sent">Status: Sent</option>
                                <option value="responded">Status: Responded</option>
                                <option value="subscribed">Status: Subscribed 🎉</option>
                                <option value="declined">Status: Declined</option>
                              </select>

                              <button
                                onClick={() => setSelectedClientId(isExpanded ? null : client.id)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                                  isExpanded 
                                    ? 'bg-amber-500 text-slate-950 border-amber-500' 
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                                }`}
                              >
                                <span>{isExpanded ? 'Hide Message' : 'Preview / Edit'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>

                              <button
                                onClick={() => deleteProspectiveClient(client.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                          </div>

                        </div>

                        {/* EXPANDED MESSAGE EDITOR & TONE CUSTOMIZER */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl space-y-4">
                            
                            {/* Message Controls Top Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              
                              {/* Channel Switcher */}
                              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                                <button
                                  onClick={() => setMessageChannelTab('whatsapp')}
                                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                                    messageChannelTab === 'whatsapp'
                                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp Copy</span>
                                </button>

                                <button
                                  onClick={() => setMessageChannelTab('email')}
                                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                                    messageChannelTab === 'email'
                                      ? 'bg-blue-500 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>Email Copy</span>
                                </button>
                              </div>

                              {/* AI Tone Switcher & Promo Code */}
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400 text-[11px]">Tone:</span>
                                  <select
                                    value={messageTone}
                                    onChange={(e) => setMessageTone(e.target.value as any)}
                                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
                                  >
                                    <option value="free_trial">14-Day Free Pass</option>
                                    <option value="urgent_leads">Urgent Buyers Waiting</option>
                                    <option value="high_roi">0% Commission ROI</option>
                                    <option value="friendly_intro">Friendly Industry Hello</option>
                                  </select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-400 text-[11px]">Voucher:</span>
                                  <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-amber-400 font-mono text-xs w-24 focus:outline-none"
                                  />
                                </div>

                                <button
                                  onClick={() => handleTailorMessage(client)}
                                  disabled={isTailoring}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                                >
                                  {isTailoring ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-3 h-3" />
                                  )}
                                  <span>AI Re-Write</span>
                                </button>
                              </div>

                            </div>

                            {/* Editable Textarea */}
                            <div>
                              <textarea
                                rows={messageChannelTab === 'whatsapp' ? 8 : 10}
                                value={
                                  messageChannelTab === 'whatsapp' 
                                    ? client.personalizedMessageWhatsApp 
                                    : client.personalizedMessageEmail
                                }
                                onChange={(e) => {
                                  if (messageChannelTab === 'whatsapp') {
                                    client.personalizedMessageWhatsApp = e.target.value;
                                  } else {
                                    client.personalizedMessageEmail = e.target.value;
                                  }
                                }}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-amber-500 selection:bg-amber-500 selection:text-slate-950"
                              />
                            </div>

                            {/* Bottom Dispatch Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Target Phone:</span>
                                <strong className="text-white font-mono">{client.whatsapp || client.phone}</strong>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-400">Target Email:</span>
                                <strong className="text-white font-mono">{client.email}</strong>
                                {messageChannelTab === 'email' && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-slate-400">Primary Sender:</span>
                                    <span className="text-amber-400 font-mono font-bold">partssource-za@outlook.com</span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopy(
                                    messageChannelTab === 'whatsapp' 
                                      ? client.personalizedMessageWhatsApp 
                                      : client.personalizedMessageEmail,
                                    client.id
                                  )}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors"
                                >
                                  {copiedKey === client.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Message</span>
                                    </>
                                  )}
                                </button>

                                {messageChannelTab === 'whatsapp' ? (
                                  <button
                                    onClick={() => handleSendWhatsApp(client)}
                                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Send via WhatsApp</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSendEmail(client)}
                                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Open Email Client</span>
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: MANUAL LEAD ENTRY */}
          {activeTab === 'manual' && (
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 max-w-3xl mx-auto space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  Add Custom Automotive Client or Yard Lead
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Encountered a scrap yard, panel beater, or gearbox specialist in your area? Add them here to automatically draft personalized WhatsApp pitches.
                </p>
              </div>

              <form onSubmit={handleAddManualLead} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pretoria 4x4 Spares & Bakkie Salvage"
                      value={manualForm.businessName}
                      onChange={(e) => setManualForm({ ...manualForm, businessName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Johan, Farouk, Heinrich..."
                      value={manualForm.contactPerson}
                      onChange={(e) => setManualForm({ ...manualForm, contactPerson: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Archetype</label>
                    <select
                      value={manualForm.archetype}
                      onChange={(e) => setManualForm({ ...manualForm, archetype: e.target.value as ClientArchetype })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="scrap_yard">Scrap Yard & Salvage</option>
                      <option value="part_store">Auto Parts Store / Spares Retailer</option>
                      <option value="auto_dismantler">Auto Dismantler</option>
                      <option value="engine_importer">Engine & Gearbox Importer</option>
                      <option value="panel_beater">Panel Beater & Collision</option>
                      <option value="workshop_mechanic">Workshop & Mechanic</option>
                      <option value="commercial_fleet">Commercial Fleet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Province</label>
                    <select
                      value={manualForm.province}
                      onChange={(e) => setManualForm({ ...manualForm, province: e.target.value as SouthAfricanProvince })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {SA_PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">City / Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Johannesburg, Durban, Cape Town..."
                      value={manualForm.city}
                      onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Industrial Suburb / Hub</label>
                    <input
                      type="text"
                      placeholder="e.g. Booysens, Clairwood, Stikland..."
                      value={manualForm.industrialHub}
                      onChange={(e) => setManualForm({ ...manualForm, industrialHub: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +27 82 123 4567 or 082 123 4567"
                      value={manualForm.whatsapp}
                      onChange={(e) => setManualForm({ ...manualForm, whatsapp: e.target.value, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. sales@yardname.co.za"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Vehicle Brands or Spares Specialty</label>
                    <input
                      type="text"
                      placeholder="e.g. Toyota Hilux, Fortuner, Quantum & Ford Ranger 4x4"
                      value={manualForm.vehicleSpecialty}
                      onChange={(e) => setManualForm({ ...manualForm, vehicleSpecialty: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pipeline')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Save Lead & Generate Pitches</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Targeting South African Automotive Corridors (Gauteng, Western Cape, KZN, Eastern Cape)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              New AI Search
            </button>
            <button
              onClick={() => setIsClientOutreachModalOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
