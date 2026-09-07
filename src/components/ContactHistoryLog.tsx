import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProspectiveClient, ClientOutreachStatus, OutreachContactMethod, ClientArchetype, SouthAfricanProvince } from '../types';
import { 
  History, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Filter, 
  Search, 
  Download, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown, 
  Copy, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  RefreshCw,
  X,
  Check,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactHistoryLogProps {
  onSelectClientForPitch?: (client: ProspectiveClient) => void;
}

export const ContactHistoryLog: React.FC<ContactHistoryLogProps> = ({ onSelectClientForPitch }) => {
  const { 
    prospectiveClients, 
    updateClientStatus, 
    logContactInteraction, 
    showNotification 
  } = useApp();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent_contact' | 'oldest_contact' | 'never_contacted_first' | 'name_asc' | 'potential_high'>('recent_contact');

  // Expanded client rows to see full contact timeline
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Quick Log Interaction Modal State
  const [loggingClient, setLoggingClient] = useState<ProspectiveClient | null>(null);
  const [logDate, setLogDate] = useState<string>(() => new Date().toISOString().slice(0, 16));
  const [logMethod, setLogMethod] = useState<OutreachContactMethod>('whatsapp');
  const [logStatus, setLogStatus] = useState<ClientOutreachStatus>('sent');
  const [logNotes, setLogNotes] = useState<string>('');

  // Statistics calculation across all scrapyards & parts store entries
  const totalEntries = prospectiveClients.length;
  const contactedEntries = prospectiveClients.filter(c => c.lastContactedAt && c.status !== 'pending');
  const contactedCount = contactedEntries.length;
  const uncontactedCount = totalEntries - contactedCount;
  const contactedPercentage = totalEntries > 0 ? Math.round((contactedCount / totalEntries) * 100) : 0;

  const whatsappCount = prospectiveClients.filter(c => c.contactMethod === 'whatsapp' && c.status !== 'pending').length;
  const emailCount = prospectiveClients.filter(c => c.contactMethod === 'email' && c.status !== 'pending').length;
  const callCount = prospectiveClients.filter(c => c.contactMethod === 'call' && c.status !== 'pending').length;
  const inPersonCount = prospectiveClients.filter(c => c.contactMethod === 'in_person' && c.status !== 'pending').length;

  const respondedCount = prospectiveClients.filter(c => c.status === 'responded').length;
  const subscribedCount = prospectiveClients.filter(c => c.status === 'subscribed').length;
  const sentCount = prospectiveClients.filter(c => c.status === 'sent').length;

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    return prospectiveClients.filter(client => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = client.businessName.toLowerCase().includes(q);
        const matchesContact = client.contactPerson.toLowerCase().includes(q);
        const matchesSpecialty = client.vehicleSpecialty.toLowerCase().includes(q);
        const matchesCity = client.city.toLowerCase().includes(q);
        const matchesHub = client.industrialHub.toLowerCase().includes(q);
        const matchesEmail = client.email.toLowerCase().includes(q);
        const matchesPhone = client.phone.includes(q) || client.whatsapp.includes(q);
        const matchesNotes = client.notes ? client.notes.toLowerCase().includes(q) : false;

        if (!matchesName && !matchesContact && !matchesSpecialty && !matchesCity && !matchesHub && !matchesEmail && !matchesPhone && !matchesNotes) {
          return false;
        }
      }

      // Archetype filter
      if (archetypeFilter !== 'all') {
        if (archetypeFilter === 'scrapyards_dismantlers') {
          if (client.archetype !== 'scrap_yard' && client.archetype !== 'auto_dismantler') return false;
        } else if (archetypeFilter === 'parts_stores') {
          if (client.archetype !== 'part_store' && client.archetype !== 'engine_importer') return false;
        } else if (client.archetype !== archetypeFilter) {
          return false;
        }
      }

      // Communication Method filter
      if (methodFilter !== 'all') {
        if (methodFilter === 'uncontacted') {
          if (client.lastContactedAt && client.status !== 'pending') return false;
        } else if (client.contactMethod !== methodFilter) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'all_contacted') {
          if (!client.lastContactedAt || client.status === 'pending') return false;
        } else if (client.status !== statusFilter) {
          return false;
        }
      }

      // Province filter
      if (provinceFilter !== 'all' && client.province !== provinceFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'recent_contact') {
        const dateA = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
        const dateB = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'oldest_contact') {
        const dateA = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 9999999999999;
        const dateB = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 9999999999999;
        return dateA - dateB;
      }
      if (sortBy === 'never_contacted_first') {
        const contactedA = a.lastContactedAt && a.status !== 'pending' ? 1 : 0;
        const contactedB = b.lastContactedAt && b.status !== 'pending' ? 1 : 0;
        if (contactedA !== contactedB) return contactedA - contactedB;
        return a.businessName.localeCompare(b.businessName);
      }
      if (sortBy === 'name_asc') {
        return a.businessName.localeCompare(b.businessName);
      }
      if (sortBy === 'potential_high') {
        return (b.potentialMonthlyZAR || 0) - (a.potentialMonthlyZAR || 0);
      }
      return 0;
    });
  }, [prospectiveClients, searchTerm, archetypeFilter, methodFilter, statusFilter, provinceFilter, sortBy]);

  // Open Log Modal for specific client
  const handleOpenLogModal = (client: ProspectiveClient) => {
    setLoggingClient(client);
    setLogDate(new Date().toISOString().slice(0, 16));
    setLogMethod(client.contactMethod || 'whatsapp');
    setLogStatus(client.status === 'pending' ? 'sent' : client.status);
    setLogNotes(client.notes || '');
  };

  // Submit Log Entry
  const handleSaveLogEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingClient) return;

    const isoDate = new Date(logDate).toISOString();
    logContactInteraction(loggingClient.id, {
      date: isoDate,
      method: logMethod,
      status: logStatus,
      notes: logNotes.trim() || undefined
    });

    showNotification(
      'Contact Logged',
      `Updated contact record for ${loggingClient.businessName} via ${logMethod.toUpperCase()}.`,
      'success'
    );
    setLoggingClient(null);
  };

  // Export CSV of contact history log
  const handleExportCSV = () => {
    const headers = [
      'Business Name',
      'Archetype',
      'Contact Person',
      'Phone',
      'WhatsApp',
      'Email',
      'Province',
      'City',
      'Industrial Hub',
      'Vehicle Specialty',
      'Last Date Contacted',
      'Communication Method',
      'Status',
      'Notes'
    ];

    const rows = filteredClients.map(c => [
      `"${c.businessName.replace(/"/g, '""')}"`,
      `"${c.archetype}"`,
      `"${c.contactPerson.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.whatsapp}"`,
      `"${c.email}"`,
      `"${c.province}"`,
      `"${c.city}"`,
      `"${c.industrialHub}"`,
      `"${c.vehicleSpecialty.replace(/"/g, '""')}"`,
      `"${c.lastContactedAt ? new Date(c.lastContactedAt).toLocaleString('en-ZA') : 'Never Contacted'}"`,
      `"${c.contactMethod || 'None'}"`,
      `"${c.status}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `partssource_za_contact_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('CSV Exported', 'Contact History Log downloaded successfully.', 'success');
  };

  // Helper formatting for date
  const formatContactDate = (isoString?: string) => {
    if (!isoString) return { dateStr: 'Never Contacted', timeStr: '', relativeStr: 'Pending First Outreach', isRecent: false };
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { dateStr: 'Never Contacted', timeStr: '', relativeStr: 'Pending First Outreach', isRecent: false };

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    let relativeStr = '';
    if (diffHours < 1) relativeStr = 'Just now';
    else if (diffHours < 24) relativeStr = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    else if (diffDays === 1) relativeStr = 'Yesterday';
    else if (diffDays < 7) relativeStr = `${diffDays} days ago`;
    else relativeStr = `${Math.floor(diffDays / 7)} wk${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;

    const dateStr = d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });

    return {
      dateStr,
      timeStr,
      relativeStr,
      isRecent: diffDays <= 2
    };
  };

  // Helper badge for method
  const renderMethodBadge = (method?: OutreachContactMethod) => {
    switch (method) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            <span>WhatsApp</span>
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Mail className="w-3 h-3 text-sky-400" />
            <span>Email</span>
          </span>
        );
      case 'call':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Phone className="w-3 h-3 text-purple-400" />
            <span>Phone Call</span>
          </span>
        );
      case 'in_person':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>In-Person Yard Visit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Uncontacted</span>
          </span>
        );
    }
  };

  // Helper badge for status
  const renderStatusBadge = (status: ClientOutreachStatus) => {
    switch (status) {
      case 'subscribed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Subscribed</span>
          </span>
        );
      case 'responded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Responded / In Talks</span>
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
            <Send className="w-3 h-3 text-amber-400" />
            <span>Outreached / Sent</span>
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Declined</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Pending Outreach</span>
          </span>
        );
    }
  };

  // Helper archetype badge
  const renderArchetypeBadge = (archetype: ClientArchetype) => {
    switch (archetype) {
      case 'scrap_yard':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">Scrap Yard</span>;
      case 'auto_dismantler':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">Auto Dismantler</span>;
      case 'part_store':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Parts Store</span>;
      case 'engine_importer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">Engine Importer</span>;
      case 'panel_beater':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">Panel Beater</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">{archetype.replace('_', ' ')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TOP ANALYTICS & SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Tracked */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Yards & Stores</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-black text-white">{totalEntries}</div>
          <span className="text-[10px] text-slate-500">Full SA database records</span>
        </div>

        {/* Total Contacted */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-amber-500/20 shadow-sm">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Contacted Rate</span>
            <History className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">{contactedCount} <span className="text-xs font-normal text-slate-400">({contactedPercentage}%)</span></div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${contactedPercentage}%` }}></div>
          </div>
        </div>

        {/* WhatsApp Channel */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">via WhatsApp</span>
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">{whatsappCount}</div>
          <span className="text-[10px] text-slate-400">Direct sales desk chat</span>
        </div>

        {/* Email Channel */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-sky-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">via Email</span>
            <Mail className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-400">{emailCount}</div>
          <span className="text-[10px] text-slate-400">Proposal invitations sent</span>
        </div>

        {/* In Talks / Responded */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Responded / Active</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400">{respondedCount + subscribedCount}</div>
          <span className="text-[10px] text-emerald-400 font-medium">{subscribedCount} fully subscribed</span>
        </div>

        {/* Uncontacted Pending */}
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Outreach</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-300">{uncontactedCount}</div>
          <button 
            onClick={() => {
              setStatusFilter('pending');
              setMethodFilter('uncontacted');
            }}
            className="text-[10px] text-amber-400 hover:underline font-bold"
          >
            Show uncontacted
          </button>
        </div>

      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scrapyard or parts store by name, contact, specialty, hub, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Actions (Export CSV, Reset) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
              title="Download full contact history log as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>

            {(searchTerm || archetypeFilter !== 'all' || methodFilter !== 'all' || statusFilter !== 'all' || provinceFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setArchetypeFilter('all');
                  setMethodFilter('all');
                  setStatusFilter('all');
                  setProvinceFilter('all');
                  setSortBy('recent_contact');
                }}
                className="flex items-center gap-1 px-2.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
                title="Reset all filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
          
          {/* Archetype */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Business Type</label>
            <select
              value={archetypeFilter}
              onChange={(e) => setArchetypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Business Types ({totalEntries})</option>
              <option value="scrapyards_dismantlers">Scrap Yards & Dismantlers</option>
              <option value="parts_stores">Parts Stores & Retailers</option>
              <option value="scrap_yard">Scrap Yards Only</option>
              <option value="auto_dismantler">Auto Dismantlers Only</option>
              <option value="part_store">Parts Stores Only</option>
              <option value="engine_importer">Engine Importers</option>
              <option value="panel_beater">Panel Beaters</option>
            </select>
          </div>

          {/* Communication Method */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Outreach Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Channels</option>
              <option value="whatsapp">WhatsApp ({whatsappCount})</option>
              <option value="email">Email ({emailCount})</option>
              <option value="call">Phone Call ({callCount})</option>
              <option value="in_person">In-Person Visit ({inPersonCount})</option>
              <option value="uncontacted">Uncontacted ({uncontactedCount})</option>
            </select>
          </div>

          {/* Outreach Status */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="all_contacted">All Contacted ({contactedCount})</option>
              <option value="subscribed">Subscribed ({subscribedCount})</option>
              <option value="responded">Responded ({respondedCount})</option>
              <option value="sent">Sent / Outreached ({sentCount})</option>
              <option value="pending">Pending Outreach ({uncontactedCount})</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          {/* Province */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Province</label>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Provinces</option>
              <option value="Gauteng">Gauteng</option>
              <option value="Western Cape">Western Cape</option>
              <option value="KwaZulu-Natal">KwaZulu-Natal</option>
              <option value="Eastern Cape">Eastern Cape</option>
              <option value="Free State">Free State</option>
              <option value="Mpumalanga">Mpumalanga</option>
              <option value="Limpopo">Limpopo</option>
              <option value="North West">North West</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Sort Log By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-300 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="recent_contact">Latest Contact Date (Newest)</option>
              <option value="oldest_contact">Earliest Contact Date</option>
              <option value="never_contacted_first">Uncontacted First</option>
              <option value="name_asc">Business Name (A-Z)</option>
              <option value="potential_high">Potential ARR (Highest)</option>
            </select>
          </div>

        </div>

      </div>

      {/* CONTACT HISTORY LOG TABLE */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        
        {/* Table Header Bar */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">
              Contact History Records ({filteredClients.length} of {totalEntries})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click any row to view complete communication timeline & interaction notes
          </span>
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
              <History className="w-6 h-6" />
            </div>
            <div className="text-base font-bold text-white">No records match your filters</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search keywords, business archetype filter, or communication channel criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setArchetypeFilter('all');
                setMethodFilter('all');
                setStatusFilter('all');
                setProvinceFilter('all');
              }}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredClients.map((client) => {
              const { dateStr, timeStr, relativeStr, isRecent } = formatContactDate(client.lastContactedAt);
              const isExpanded = expandedClientId === client.id;
              const hasHistoryEntries = client.contactHistory && client.contactHistory.length > 0;

              return (
                <div key={client.id} className="transition-colors hover:bg-slate-800/30">
                  
                  {/* MAIN SUMMARY ROW */}
                  <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Business Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-bold text-white text-sm hover:text-amber-400 transition-colors cursor-pointer" onClick={() => setExpandedClientId(isExpanded ? null : client.id)}>
                          {client.businessName}
                        </h4>
                        {renderArchetypeBadge(client.archetype)}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span>{client.industrialHub}, {client.city} ({client.province})</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span>Contact: <strong className="text-slate-200">{client.contactPerson}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-slate-300">{client.phone}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 italic">{client.vehicleSpecialty}</span>
                      </div>

                      {client.notes && (
                        <div className="mt-2 text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-slate-300 flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{client.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Last Date Contacted & Method */}
                    <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-800/80">
                      
                      {/* Last Date Contacted */}
                      <div className="min-w-[150px]">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Last Contacted</span>
                        {client.lastContactedAt && client.status !== 'pending' ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                              <span>{dateStr}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{timeStr}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${isRecent ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                                {relativeStr}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            <span>Never Contacted</span>
                          </div>
                        )}
                      </div>

                      {/* Communication Method */}
                      <div className="min-w-[120px]">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Method</span>
                        {renderMethodBadge(client.contactMethod)}
                      </div>

                      {/* Status Selector */}
                      <div className="min-w-[130px]">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Current Status</span>
                        <select
                          value={client.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as ClientOutreachStatus;
                            updateClientStatus(client.id, newStatus, client.notes, client.contactMethod || 'whatsapp');
                          }}
                          className={`text-xs px-2.5 py-1 rounded-xl font-bold border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            client.status === 'subscribed'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : client.status === 'responded'
                              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                              : client.status === 'sent'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                              : client.status === 'declined'
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="sent">Sent / Outreached</option>
                          <option value="responded">Responded</option>
                          <option value="subscribed">Subscribed</option>
                          <option value="declined">Declined</option>
                        </select>
                      </div>

                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-800/80 justify-end">
                      
                      {/* Log Interaction Button */}
                      <button
                        onClick={() => handleOpenLogModal(client)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        title="Log a new phone call, visit, WhatsApp or email interaction"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Log Contact</span>
                      </button>

                      {/* Direct WhatsApp Action */}
                      <a
                        href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(client.personalizedMessageWhatsApp)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          updateClientStatus(client.id, 'sent', 'Direct WhatsApp dispatched from Contact History Log', 'whatsapp');
                        }}
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title={`WhatsApp ${client.contactPerson}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>

                      {/* Direct Email Action */}
                      <a
                        href={`mailto:${client.email}?subject=Partnership%20Proposal%20for%20${encodeURIComponent(client.businessName)}%20-%20Part%20Source%20ZA&body=${encodeURIComponent(client.personalizedMessageEmail)}`}
                        onClick={() => {
                          updateClientStatus(client.id, 'sent', 'Direct email dispatched from Contact History Log', 'email');
                        }}
                        className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
                        title={`Email ${client.contactPerson}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>

                      {/* Pitch / Message Button */}
                      {onSelectClientForPitch && (
                        <button
                          onClick={() => onSelectClientForPitch(client)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Open tailored message composer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span className="hidden sm:inline">Pitch</span>
                        </button>
                      )}

                      {/* Toggle Expand History */}
                      <button
                        onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title={isExpanded ? 'Collapse timeline' : 'Expand full contact history timeline'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                    </div>

                  </div>

                  {/* EXPANDED CONTACT TIMELINE ACCORDION */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 pt-2 bg-slate-950/70 border-t border-slate-800/60"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-amber-400" />
                              <span>Complete Interaction Timeline for {client.businessName}</span>
                            </span>
                            <button
                              onClick={() => handleOpenLogModal(client)}
                              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Log New Interaction</span>
                            </button>
                          </div>

                          {/* Timeline entries */}
                          {hasHistoryEntries ? (
                            <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                              {client.contactHistory!.map((entry, idx) => {
                                const entryDate = formatContactDate(entry.date);
                                return (
                                  <div key={entry.id || idx} className="relative text-xs">
                                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-950"></div>
                                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                          {renderMethodBadge(entry.method)}
                                          {renderStatusBadge(entry.status)}
                                        </div>
                                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                          <Calendar className="w-3 h-3 text-slate-500" />
                                          <span>{entryDate.dateStr} at {entryDate.timeStr}</span>
                                          <span className="text-slate-600">({entryDate.relativeStr})</span>
                                        </span>
                                      </div>
                                      {entry.notes && (
                                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                                          {entry.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-900/60 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500 space-y-1">
                              <p>No past interaction history logged yet for this supplier.</p>
                              <button
                                onClick={() => handleOpenLogModal(client)}
                                className="text-amber-400 font-bold hover:underline"
                              >
                                Click here to log the first outreach interaction
                              </button>
                            </div>
                          )}

                          {/* Quick details footer */}
                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                            <div>
                              <span>Pitch Hook: </span>
                              <span className="text-slate-400 italic">"{client.pitchHook}"</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Potential: <strong className="text-emerald-400">R{client.potentialMonthlyZAR} / mo</strong></span>
                              <span className="text-slate-700">•</span>
                              <span>Plan: <strong className="text-amber-400 uppercase">{client.recommendedTier}</strong></span>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* QUICK LOG INTERACTION MODAL */}
      <AnimatePresence>
        {loggingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Log Contact Interaction</h3>
                    <p className="text-xs text-slate-400">{loggingClient.businessName} • {loggingClient.contactPerson}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLoggingClient(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLogEntry} className="p-4 sm:p-6 space-y-4">
                
                {/* Date and Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Date & Time Contacted
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Defaults to right now, or select past timestamp</span>
                </div>

                {/* Communication Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Communication Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setLogMethod('whatsapp')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        logMethod === 'whatsapp'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLogMethod('email')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        logMethod === 'email'
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Mail className="w-4 h-4 text-sky-400" />
                      <span>Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLogMethod('call')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        logMethod === 'call'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span>Phone Call</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLogMethod('in_person')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        logMethod === 'in_person'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>Yard Visit</span>
                    </button>
                  </div>
                </div>

                {/* Outreach Outcome Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Interaction Outcome & Status
                  </label>
                  <select
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value as ClientOutreachStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="sent">Message / Proposal Sent (Awaiting Response)</option>
                    <option value="responded">Responded / In Discussion (Interested in trial)</option>
                    <option value="subscribed">Subscribed / Onboarded (Active Supplier)</option>
                    <option value="declined">Declined (Not interested currently)</option>
                    <option value="pending">Pending (Needs follow-up)</option>
                  </select>
                </div>

                {/* Conversation Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Interaction Notes & Feedback
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Spoke to Johan on WhatsApp. He requested assistance uploading his Excel inventory of 40 Hilux engines and gearboxes..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setLoggingClient(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Contact Log</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
