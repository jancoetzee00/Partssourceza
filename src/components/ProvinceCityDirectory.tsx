import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Copy, 
  Send, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Wrench, 
  Clock, 
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  ProspectiveClient, 
  ClientArchetype, 
  ClientOutreachStatus, 
  SouthAfricanProvince 
} from '../types';
import { SA_PROVINCES } from '../data/mockData';

interface ProvinceCityDirectoryProps {
  onSelectClientForPitch?: (client: ProspectiveClient) => void;
}

type DirectoryCategoryFilter = 'all' | 'scrap_yards' | 'part_stores';
type MessagedStatusFilter = 'all' | 'messaged' | 'not_messaged';

const ARCHETYPE_INFO: Record<ClientArchetype, { label: string; icon: string; badgeColor: string }> = {
  scrap_yard: { label: 'Scrap Yard & Salvage', icon: '🏗️', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  auto_dismantler: { label: 'Auto Dismantler', icon: '🔧', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  part_store: { label: 'Auto Parts Store / Spares Retailer', icon: '🏪', badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  engine_importer: { label: 'Engine & Gearbox Importer', icon: '⚙️', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  panel_beater: { label: 'Panel Beater & Collision', icon: '🔨', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  workshop_mechanic: { label: 'RMI / Independent Workshop', icon: '🧰', badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  commercial_fleet: { label: 'Commercial Fleet / Trucks', icon: '🚛', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  taxi_association: { label: 'Taxi Association (SANTACO)', icon: '🚐', badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' }
};

export const ProvinceCityDirectory: React.FC<ProvinceCityDirectoryProps> = ({ onSelectClientForPitch }) => {
  const { prospectiveClients, updateClientStatus, showNotification } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<DirectoryCategoryFilter>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<MessagedStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [expandedPitchId, setExpandedPitchId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Determine available cities dynamically based on selected province & category
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    prospectiveClients.forEach(client => {
      if (provinceFilter !== 'all' && client.province !== provinceFilter) return;
      if (categoryFilter === 'scrap_yards' && !['scrap_yard', 'auto_dismantler', 'engine_importer'].includes(client.archetype)) return;
      if (categoryFilter === 'part_stores' && client.archetype !== 'part_store') return;
      if (client.city) set.add(client.city);
    });
    return Array.from(set).sort();
  }, [prospectiveClients, provinceFilter, categoryFilter]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return prospectiveClients.filter(c => {
      // Category filter
      if (categoryFilter === 'scrap_yards') {
        const isScrapYard = c.archetype === 'scrap_yard' || c.archetype === 'auto_dismantler' || c.archetype === 'engine_importer';
        if (!isScrapYard) return false;
      } else if (categoryFilter === 'part_stores') {
        if (c.archetype !== 'part_store') return false;
      }

      // Province filter
      if (provinceFilter !== 'all' && c.province !== provinceFilter) return false;

      // City filter
      if (cityFilter !== 'all' && c.city.toLowerCase() !== cityFilter.toLowerCase()) return false;

      // Messaged status filter
      const isMessaged = c.status !== 'pending';
      if (statusFilter === 'messaged' && !isMessaged) return false;
      if (statusFilter === 'not_messaged' && isMessaged) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.businessName.toLowerCase().includes(q);
        const matchContact = c.contactPerson.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q) || c.whatsapp.includes(q);
        const matchSpecialty = c.vehicleSpecialty.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        const matchHub = c.industrialHub.toLowerCase().includes(q);
        if (!matchName && !matchContact && !matchPhone && !matchSpecialty && !matchCity && !matchHub) {
          return false;
        }
      }

      return true;
    });
  }, [prospectiveClients, categoryFilter, provinceFilter, cityFilter, statusFilter, searchQuery]);

  // Summary counts
  const totalScrapYards = useMemo(() => {
    return prospectiveClients.filter(c => ['scrap_yard', 'auto_dismantler', 'engine_importer'].includes(c.archetype)).length;
  }, [prospectiveClients]);

  const totalPartStores = useMemo(() => {
    return prospectiveClients.filter(c => c.archetype === 'part_store').length;
  }, [prospectiveClients]);

  const messagedCount = useMemo(() => {
    return prospectiveClients.filter(c => c.status !== 'pending').length;
  }, [prospectiveClients]);

  const pendingCount = useMemo(() => {
    return prospectiveClients.filter(c => c.status === 'pending').length;
  }, [prospectiveClients]);

  // Group filtered clients by Province, and then City
  const groupedByProvinceAndCity = useMemo(() => {
    const provMap: Record<string, Record<string, ProspectiveClient[]>> = {};

    filteredClients.forEach(client => {
      const prov = client.province || 'Other Province';
      const city = client.city || 'General';

      if (!provMap[prov]) {
        provMap[prov] = {};
      }
      if (!provMap[prov][city]) {
        provMap[prov][city] = [];
      }
      provMap[prov][city].push(client);
    });

    return provMap;
  }, [filteredClients]);

  // Toggle messaged status
  const handleToggleMessaged = (client: ProspectiveClient) => {
    if (client.status === 'pending') {
      updateClientStatus(client.id, 'sent', 'Manually marked as messaged in directory', 'whatsapp');
      showNotification('Marked as Messaged', `Marked ${client.businessName} as messaged.`, 'success');
    } else {
      updateClientStatus(client.id, 'pending', 'Reset to not contacted');
      showNotification('Status Reset', `${client.businessName} marked as not yet contacted.`, 'info');
    }
  };

  // Launch WhatsApp pitch & mark as messaged
  const handleSendWhatsAppPitch = (client: ProspectiveClient) => {
    const rawNum = client.whatsapp || client.phone;
    let clean = rawNum.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '27' + clean.slice(1);
    if (!clean.startsWith('27') && clean.length === 9) clean = '27' + clean;

    const message = encodeURIComponent(client.personalizedMessageWhatsApp);
    const url = `https://wa.me/${clean}?text=${message}`;
    window.open(url, '_blank');

    updateClientStatus(client.id, 'sent', 'Dispatched WhatsApp proposal from directory', 'whatsapp');
    showNotification('WhatsApp Pitch Launched', `Opened WhatsApp for ${client.contactPerson} (${client.businessName}). Marked as Messaged!`, 'success');
  };

  // Launch Email pitch & mark as messaged
  const handleSendEmailPitch = (client: ProspectiveClient) => {
    if (!client.email) {
      showNotification('No Email', 'No email address available for this contact.', 'warning');
      return;
    }

    const lines = client.personalizedMessageEmail.split('\n');
    let subject = `Partnership Invitation: ${client.businessName} on Part Source ZA`;
    let body = client.personalizedMessageEmail;

    if (lines[0] && lines[0].toLowerCase().startsWith('subject:')) {
      subject = lines[0].replace(/^subject:\s*/i, '');
      body = lines.slice(1).join('\n').trim();
    }

    const mailto = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');

    updateClientStatus(client.id, 'sent', 'Sent email proposal from directory', 'email');
    showNotification('Email Client Opened', `Drafted email to ${client.email}. Marked as Messaged!`, 'success');
  };

  // Copy customized pitch
  const handleCopyPitch = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showNotification('Copied', 'Pitch message copied to clipboard.', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Export full or filtered list to CSV
  const handleExportCSV = () => {
    const headers = [
      'Business Name',
      'Category',
      'Province',
      'City',
      'Industrial Hub',
      'Contact Person',
      'Phone',
      'WhatsApp',
      'Email',
      'Vehicle Specialty',
      'Messaged Status',
      'Last Contacted Date',
      'Contact Method',
      'Pitch Hook'
    ];

    const rows = filteredClients.map(c => [
      `"${c.businessName.replace(/"/g, '""')}"`,
      `"${c.archetype === 'part_store' ? 'Auto Parts Store' : 'Scrap Yard & Dismantler'}"`,
      `"${c.province}"`,
      `"${c.city}"`,
      `"${c.industrialHub || ''}"`,
      `"${c.contactPerson}"`,
      `"${c.phone}"`,
      `"${c.whatsapp}"`,
      `"${c.email}"`,
      `"${c.vehicleSpecialty.replace(/"/g, '""')}"`,
      `"${c.status !== 'pending' ? 'ALREADY MESSAGED (' + c.status.toUpperCase() + ')' : 'NOT MESSAGED YET'}"`,
      `"${c.lastContactedAt ? new Date(c.lastContactedAt).toLocaleDateString() : 'N/A'}"`,
      `"${c.contactMethod || 'None'}"`,
      `"${c.pitchHook.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PartSourceZA_Directory_ScrapYards_and_PartStores_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('CSV Exported', `Downloaded ${filteredClients.length} businesses to CSV.`, 'success');
  };

  // Copy formatted list to clipboard
  const handleCopyFormattedList = () => {
    let text = `# PART SOURCE ZA — SOUTH AFRICAN SCRAP YARDS & AUTO PARTS STORES DIRECTORY\n`;
    text += `Generated: ${new Date().toLocaleDateString('en-ZA')} | Total Records: ${filteredClients.length}\n\n`;

    Object.entries(groupedByProvinceAndCity).forEach(([province, cities]) => {
      text += `====================================================\n`;
      text += `📍 PROVINCE: ${province.toUpperCase()}\n`;
      text += `====================================================\n\n`;

      Object.entries(cities).forEach(([city, clients]) => {
        text += `  🏙️ City / Hub: ${city}\n`;
        text += `  ------------------------------------------------\n`;

        clients.forEach((c, idx) => {
          const typeLabel = c.archetype === 'part_store' ? 'Auto Parts Store' : 'Scrap Yard';
          const statusBadge = c.status !== 'pending' ? `[ALREADY MESSAGED - ${c.status.toUpperCase()}]` : `[NOT MESSAGED YET]`;
          text += `  ${idx + 1}. ${c.businessName} (${typeLabel}) ${statusBadge}\n`;
          text += `     Contact: ${c.contactPerson} | Phone/WA: ${c.whatsapp || c.phone} | Email: ${c.email}\n`;
          text += `     Hub: ${c.industrialHub} | Specialty: ${c.vehicleSpecialty}\n`;
          if (c.lastContactedAt) {
            text += `     Last Contacted: ${new Date(c.lastContactedAt).toLocaleString()} via ${c.contactMethod || 'WhatsApp'}\n`;
          }
          text += `\n`;
        });
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    showNotification('List Copied to Clipboard', 'Full compiled directory with messaged statuses copied.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* DIRECTORY OVERVIEW BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                COMPILED SA AUTOMOTIVE DIRECTORY
              </span>
              <span className="text-xs text-slate-400">9 Provinces Covered</span>
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">
              Scrap Yards & Auto Parts Stores by Province & City
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Track outreach progress across verified South African automotive dismantlers, salvage yards, and replacement spares retailers. Easily mark who has already been messaged via WhatsApp or Email.
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Primary Outreach & Sender Email:</span>
              <a href="mailto:partssource-za@outlook.com" className="text-amber-400 font-mono font-bold hover:underline">partssource-za@outlook.com</a>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCopyFormattedList}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
              title="Copy clean formatted text list with Province & City grouping"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy List</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              title="Download full directory as CSV for Excel / Google Sheets"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">🏗️ Scrap Yards</span>
            <span className="text-base font-black text-white">{totalScrapYards}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Dismantlers & Salvage</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-teal-400 font-bold block uppercase tracking-wider">🏪 Part Stores</span>
            <span className="text-base font-black text-white">{totalPartStores}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Retailers & Spares Shops</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">✅ Already Messaged</span>
            <span className="text-base font-black text-emerald-400">{messagedCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {prospectiveClients.length > 0 ? Math.round((messagedCount / prospectiveClients.length) * 100) : 0}% Outreach Complete
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">⏳ Not Messaged Yet</span>
            <span className="text-base font-black text-amber-300">{pendingCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Ready to Pitch</span>
          </div>
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
        {/* Category Tabs: All vs Scrap Yards vs Part Stores */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => { setCategoryFilter('all'); setCityFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                categoryFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Types ({prospectiveClients.length})</span>
            </button>

            <button
              onClick={() => { setCategoryFilter('scrap_yards'); setCityFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                categoryFilter === 'scrap_yards'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏗️ Scrap Yards ({totalScrapYards})</span>
            </button>

            <button
              onClick={() => { setCategoryFilter('part_stores'); setCityFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                categoryFilter === 'part_stores'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏪 Part Stores ({totalPartStores})</span>
            </button>
          </div>

          {/* Messaged Filter Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setStatusFilter('messaged')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                statusFilter === 'messaged' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Messaged ({messagedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('not_messaged')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                statusFilter === 'not_messaged' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>Not Messaged ({pendingCount})</span>
            </button>
          </div>
        </div>

        {/* Filters Row: Province, City, and Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Province Filter */}
          <div className="sm:col-span-4">
            <label className="block text-slate-400 font-semibold mb-1">Filter Province</label>
            <select
              value={provinceFilter}
              onChange={(e) => {
                setProvinceFilter(e.target.value);
                setCityFilter('all');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">🇿🇦 All Provinces ({prospectiveClients.length})</option>
              {SA_PROVINCES.map(prov => {
                const count = prospectiveClients.filter(c => c.province === prov).length;
                return (
                  <option key={prov} value={prov}>
                    {prov} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* City / Hub Filter */}
          <div className="sm:col-span-4">
            <label className="block text-slate-400 font-semibold mb-1">Filter City / Hub</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">All Cities / Hubs ({availableCities.length} available)</option>
              {availableCities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Keyword Search */}
          <div className="sm:col-span-4">
            <label className="block text-slate-400 font-semibold mb-1">Search Directory</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search business, owner, phone, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER RESULTS COUNTER */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="text-white font-bold">{filteredClients.length}</span> businesses{' '}
          {categoryFilter === 'scrap_yards' ? 'in Scrap Yards' : categoryFilter === 'part_stores' ? 'in Part Stores' : ''}
          {provinceFilter !== 'all' ? ` in ${provinceFilter}` : ''}
          {cityFilter !== 'all' ? ` • ${cityFilter}` : ''}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 font-medium">{filteredClients.filter(c => c.status !== 'pending').length} Messaged</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span className="text-amber-300 font-medium">{filteredClients.filter(c => c.status === 'pending').length} Uncontacted</span>
          </span>
        </div>
      </div>

      {/* HIERARCHICAL PROVINCE & CITY DIRECTORY CARDS */}
      {filteredClients.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-white font-bold text-sm">No businesses match the selected filters</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your province or city dropdown, or clearing the search keyword.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setProvinceFilter('all');
              setCityFilter('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByProvinceAndCity).map(([province, cities]) => {
            const provinceClientsCount = Object.values(cities).flat().length;
            const provinceMessagedCount = Object.values(cities).flat().filter(c => c.status !== 'pending').length;

            return (
              <div key={province} className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                {/* PROVINCE HEADER STRIP */}
                <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-black text-white tracking-wide uppercase">
                      {province}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {provinceClientsCount} {provinceClientsCount === 1 ? 'Business' : 'Businesses'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Outreach:{' '}
                      <span className="font-bold text-emerald-400">{provinceMessagedCount}</span> / {provinceClientsCount} Messaged
                    </span>
                  </div>
                </div>

                {/* CITIES & HUBS WITHIN PROVINCE */}
                <div className="p-4 sm:p-5 space-y-6">
                  {Object.entries(cities).map(([city, clients]) => (
                    <div key={city} className="space-y-3">
                      {/* CITY TITLE BADGE */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span>🏙️</span>
                          <span>{city}</span>
                        </span>
                        <div className="h-px flex-1 bg-slate-800/80"></div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {clients.length} listed
                        </span>
                      </div>

                      {/* BUSINESS CARDS GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {clients.map(client => {
                          const isMessaged = client.status !== 'pending';
                          const archetype = ARCHETYPE_INFO[client.archetype] || ARCHETYPE_INFO.scrap_yard;
                          const isExpanded = expandedPitchId === client.id;

                          return (
                            <div 
                              key={client.id}
                              className={`rounded-xl border transition-all p-4 flex flex-col justify-between relative ${
                                isMessaged 
                                  ? 'bg-slate-950/80 border-emerald-500/30 hover:border-emerald-500/50' 
                                  : 'bg-slate-950/50 border-slate-800 hover:border-amber-500/40'
                              }`}
                            >
                              <div>
                                {/* STATUS BADGE & ARCHETYPE PILL */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${archetype.badgeColor}`}>
                                    <span>{archetype.icon}</span>
                                    <span>{client.archetype === 'part_store' ? 'Auto Parts Store' : client.archetype.replace('_', ' ').toUpperCase()}</span>
                                  </span>

                                  {/* MESSAGED BADGE (PROMINENT) */}
                                  {isMessaged ? (
                                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] font-black tracking-tight">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>ALREADY MESSAGED</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                                      <AlertCircle className="w-3 h-3 text-amber-400" />
                                      <span>Not Messaged Yet</span>
                                    </div>
                                  )}
                                </div>

                                {/* BUSINESS NAME & LOCATION */}
                                <h5 className="font-bold text-white text-sm leading-snug">
                                  {client.businessName}
                                </h5>

                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1 text-slate-300">
                                    <MapPin className="w-3 h-3 text-amber-400" />
                                    <span>{client.city}</span>
                                    {client.industrialHub && (
                                      <span className="text-slate-400">({client.industrialHub})</span>
                                    )}
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-400">{client.province}</span>
                                </div>

                                {/* VEHICLE / SPARES SPECIALTY */}
                                <div className="mt-2.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-xs">
                                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                                    Specialty & Inventory Focus:
                                  </span>
                                  <p className="text-slate-200 font-medium text-xs mt-0.5">
                                    {client.vehicleSpecialty}
                                  </p>
                                </div>

                                {/* CONTACT DETAILS */}
                                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-400">
                                  <div className="flex items-center gap-1.5 text-slate-300">
                                    <span className="text-slate-500">Contact:</span>
                                    <span className="font-semibold text-white">{client.contactPerson}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-slate-500" />
                                    <span>{client.phone}</span>
                                  </div>
                                  {client.email && (
                                    <div className="flex items-center gap-1.5 text-slate-400 truncate sm:col-span-2">
                                      <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                      <span className="truncate">{client.email}</span>
                                    </div>
                                  )}
                                </div>

                                {/* MESSAGED HISTORY STRIP (If already contacted) */}
                                {isMessaged && (
                                  <div className="mt-3 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                      <span>
                                        Contacted on{' '}
                                        {client.lastContactedAt 
                                          ? new Date(client.lastContactedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                          : 'recently'}{' '}
                                        via {client.contactMethod === 'email' ? 'Email' : client.contactMethod === 'call' ? 'Phone Call' : client.contactMethod === 'in_person' ? 'Yard Visit' : 'WhatsApp'}
                                      </span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      {client.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                )}

                                {/* EXPANDED PITCH PREVIEW ACCORDION */}
                                {isExpanded && (
                                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs animate-in fade-in duration-150">
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          WhatsApp Pitch Script:
                                        </span>
                                        <button
                                          onClick={() => handleCopyPitch(`wa-${client.id}`, client.personalizedMessageWhatsApp)}
                                          className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800"
                                        >
                                          {copiedKey === `wa-${client.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                          <span>{copiedKey === `wa-${client.id}` ? 'Copied' : 'Copy Text'}</span>
                                        </button>
                                      </div>
                                      <div className="p-2.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto border border-slate-800">
                                        {client.personalizedMessageWhatsApp}
                                      </div>
                                    </div>

                                    {client.email && (
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-bold text-blue-400 flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            Email Proposal:
                                          </span>
                                          <button
                                            onClick={() => handleCopyPitch(`em-${client.id}`, client.personalizedMessageEmail)}
                                            className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800"
                                          >
                                            {copiedKey === `em-${client.id}` ? <Check className="w-3 h-3 text-blue-400" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedKey === `em-${client.id}` ? 'Copied' : 'Copy Email'}</span>
                                          </button>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto border border-slate-800">
                                          {client.personalizedMessageEmail}
                                        </div>
                                      </div>
                                    )}

                                    {client.notes && (
                                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                                        <span className="font-semibold text-slate-300">Notes:</span> {client.notes}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* ACTIONS ROW */}
                              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                                {/* Left Action: Toggle Pitch Accordion */}
                                <button
                                  onClick={() => setExpandedPitchId(isExpanded ? null : client.id)}
                                  className="text-[11px] text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
                                >
                                  <span>{isExpanded ? 'Hide Pitch' : 'View Tailored Pitch'}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>

                                {/* Right Actions: WhatsApp, Email & Toggle Messaged */}
                                <div className="flex items-center gap-1.5">
                                  {/* Mark/Unmark Messaged Checkbox Button */}
                                  <button
                                    onClick={() => handleToggleMessaged(client)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                                      isMessaged
                                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                                    }`}
                                    title={isMessaged ? 'Reset to Not Messaged' : 'Mark as Already Messaged'}
                                  >
                                    {isMessaged ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span>Marked</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                        <span>Mark Messaged</span>
                                      </>
                                    )}
                                  </button>

                                  {/* 1-Click WhatsApp Pitch Button */}
                                  <button
                                    onClick={() => handleSendWhatsAppPitch(client)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors flex items-center gap-1 shadow-sm shadow-emerald-500/20"
                                    title="Open WhatsApp with prefilled message & automatically mark as messaged"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </button>

                                  {/* 1-Click Email Button (if available) */}
                                  {client.email && (
                                    <button
                                      onClick={() => handleSendEmailPitch(client)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                                      title="Open email composer & mark as messaged"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
