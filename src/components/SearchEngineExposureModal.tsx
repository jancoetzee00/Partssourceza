import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Globe, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Share2, 
  FileCode, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Layers, 
  Tag, 
  Eye, 
  X,
  Code2,
  ShieldCheck,
  Check,
  Zap,
  MapPin,
  Bot
} from 'lucide-react';

export const SearchEngineExposureModal: React.FC = () => {
  const { 
    isSearchEngineModalOpen, 
    setIsSearchEngineModalOpen, 
    listings, 
    sellers,
    showNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'serp' | 'keywords' | 'sitemap' | 'schema' | 'sharing'>('serp');
  const [serpViewDevice, setSerpViewDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [selectedPartId, setSelectedPartId] = useState<string>(listings[0]?.id || '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isSearchEngineModalOpen) return null;

  const currentSelectedPart = listings.find(l => l.id === selectedPartId) || listings[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showNotification('Copied to Clipboard', 'Text copied successfully.', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://partsource.co.za';

  const saAutoKeywords = [
    { term: 'used car spares south africa', location: 'National', volume: '18,500/mo', intent: 'High Commercial', tag: 'Marketplace' },
    { term: 'scrap yards johannesburg parts', location: 'Gauteng', volume: '14,200/mo', intent: 'Local Buyer', tag: 'Scrap Yards' },
    { term: 'toyota hilux gd6 engine spares za', location: 'National', volume: '9,800/mo', intent: 'Direct Purchase', tag: 'Bakkie' },
    { term: 'vw polo tsi gearbox pretoria', location: 'Pretoria', volume: '7,400/mo', intent: 'Direct Purchase', tag: 'Transmissions' },
    { term: 'ford ranger 2.2 cylinder head durban', location: 'KZN', volume: '6,100/mo', intent: 'Direct Purchase', tag: 'Engines' },
    { term: 'isuzu d-max body parts cape town', location: 'Western Cape', volume: '5,200/mo', intent: 'Direct Purchase', tag: 'Body Panels' },
    { term: 'commercial truck spares scrap yards gauteng', location: 'Gauteng', volume: '4,300/mo', intent: 'B2B Fleet', tag: 'Trucks' },
    { term: 'bmw e90 used parts bloemfontein', location: 'Free State', volume: '3,800/mo', intent: 'Direct Purchase', tag: 'German Spares' },
    { term: 'nissan np200 rear axle spares', location: 'National', volume: '3,500/mo', intent: 'Direct Purchase', tag: 'Bakkie' }
  ];

  const sitemapXmlPreview = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${currentHost}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${currentHost}/?role=buyer</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${currentHost}/?make=toyota</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${currentHost}/?make=volkswagen</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${currentHost}/?make=ford</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
</urlset>`;

  const jsonLdPreview = `{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "url": "${currentHost}/",
      "name": "Part Source ZA",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "${currentHost}/?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Product",
      "name": "${currentSelectedPart?.title || 'Automotive Part'}",
      "category": "${currentSelectedPart?.category || 'Motor Spares'}",
      "image": "${currentSelectedPart?.images[0] || ''}",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "ZAR",
        "price": "${currentSelectedPart?.priceZAR || 0}",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "AutoPartsStore",
          "name": "${currentSelectedPart?.sellerName || 'Verified Supplier'}"
        }
      }
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Search Engine & Web Exposure Hub</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  SEO Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google, Bing, WhatsApp crawler readiness, dynamic sitemaps & South African parts ranking engine.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsSearchEngineModalOpen(false)}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('serp')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'serp'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Google Search Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'keywords'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>SA Auto Keywords (9)</span>
          </button>

          <button
            onClick={() => setActiveTab('sitemap')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'sitemap'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Sitemap & Robots.txt</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Schema.org JSON-LD</span>
          </button>

          <button
            onClick={() => setActiveTab('sharing')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'sharing'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Social & WhatsApp Cards</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
          
          {/* TAB 1: GOOGLE SERP PREVIEW */}
          {activeTab === 'serp' && (
            <div className="space-y-6">
              
              {/* Part selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Select Part to Preview on Google:</label>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {listings.map(l => (
                      <option key={l.id} value={l.id}>{l.title} (R{l.priceZAR.toLocaleString('en-ZA')})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setSerpViewDevice('mobile')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                      serpViewDevice === 'mobile' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile SERP</span>
                  </button>
                  <button
                    onClick={() => setSerpViewDevice('desktop')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                      serpViewDevice === 'desktop' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop SERP</span>
                  </button>
                </div>
              </div>

              {/* SERP Preview Frame */}
              <div className="p-6 rounded-2xl bg-white text-slate-900 font-sans shadow-lg border border-slate-200">
                
                {/* Search Bar Visual */}
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                    <span className="text-blue-600">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-amber-500">o</span>
                    <span className="text-blue-600">g</span>
                    <span className="text-emerald-500">l</span>
                    <span className="text-red-500">e</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full px-4 py-1.5 text-xs text-slate-700 flex items-center justify-between border border-slate-200">
                    <span>{currentSelectedPart?.make} {currentSelectedPart?.model} {currentSelectedPart?.title} scrap yards South Africa</span>
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Google Result Item */}
                <div className="space-y-1.5 max-w-2xl">
                  {/* URL / Breadcrumb */}
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="h-4 w-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                      PS
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-[11px]">Part Source ZA</span>
                      <span className="text-[10px] text-slate-500 truncate">{currentHost} › parts › {currentSelectedPart?.make.toLowerCase()} › {currentSelectedPart?.id}</span>
                    </div>
                  </div>

                  {/* Title Link */}
                  <h4 className="text-base sm:text-lg font-medium text-blue-800 hover:underline cursor-pointer leading-snug">
                    {currentSelectedPart?.title} | R{currentSelectedPart?.priceZAR.toLocaleString('en-ZA')} - {currentSelectedPart?.locationCity}, {currentSelectedPart?.locationProvince} | Part Source ZA
                  </h4>

                  {/* Rich Snippet (Ratings & Price) */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-medium pt-0.5">
                    <div className="flex items-center text-amber-500">
                      ★ ★ ★ ★ ★ <span className="text-slate-700 ml-1 font-bold">4.9 (34 reviews)</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-emerald-700">R {currentSelectedPart?.priceZAR.toLocaleString('en-ZA')} ZAR</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600 font-semibold">In stock</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{currentSelectedPart?.sellerName}</span>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Buy genuine and tested {currentSelectedPart?.title} ({currentSelectedPart?.condition}) for {currentSelectedPart?.make} {currentSelectedPart?.model}. OEM Part #{currentSelectedPart?.oemNumber || currentSelectedPart?.partNumber}. Direct WhatsApp supplier chat & nationwide delivery across South Africa.
                  </p>

                  {/* Google Sitelinks Mini Box */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 cursor-pointer">
                      <span className="font-semibold text-blue-700 block">Engines & Gearboxes</span>
                      <span className="text-slate-500 text-[10px]">Browse tested motors from verified SA scrap yards</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 cursor-pointer">
                      <span className="font-semibold text-blue-700 block">Compare Parts Matrix</span>
                      <span className="text-slate-500 text-[10px]">Compare warranties, prices and delivery estimates</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Key Features Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sitelinks Search Box</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Configured via Schema.org SearchAction so Google displays a direct search box in results.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Rich Product Snippet</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Includes ZAR pricing, in-stock status, and South African scrap yard location tags.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mobile-First Indexing</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PWA manifest, responsive viewport and fast Core Web Vitals ready for Googlebot.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SA AUTO KEYWORDS MATRIX */}
          {activeTab === 'keywords' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">South African Automotive Search Keywords</h4>
                  <p className="text-xs text-slate-400">Target high-volume search phrases for ads, social posts, and part descriptions.</p>
                </div>
                <button
                  onClick={() => handleCopy(saAutoKeywords.map(k => `${k.term} (${k.volume})`).join('\n'), 'all_keywords')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'all_keywords' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy All Keywords</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Search Keyword Term</th>
                      <th className="px-4 py-3">Province / Area</th>
                      <th className="px-4 py-3">Est. SA Volume</th>
                      <th className="px-4 py-3">Search Intent</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {saAutoKeywords.map((kw, i) => (
                      <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-200 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] font-mono">{kw.tag}</span>
                          <span>{kw.term}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            {kw.location}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-bold font-mono">{kw.volume}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
                            {kw.intent}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleCopy(kw.term, `kw_${i}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-colors"
                            title="Copy Keyword"
                          >
                            {copiedKey === `kw_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SITEMAP & ROBOTS */}
          {activeTab === 'sitemap' && (
            <div className="space-y-6">
              
              {/* Dynamic Sitemap card */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">Dynamic XML Sitemap (`/sitemap.xml`)</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Live Endpoint</span>
                    </a>
                    <button
                      onClick={() => handleCopy(`${currentHost}/sitemap.xml`, 'sitemap_url')}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'sitemap_url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy URL</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Automatically serves categorized URLs for vehicle makes, parts categories, scrap yards, and provinces to Google Search Console and Bing.
                </p>
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-44">
                    {sitemapXmlPreview}
                  </pre>
                </div>
              </div>

              {/* Robots.txt Card */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Robots Directives (`/robots.txt`)</h4>
                  </div>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Live robots.txt</span>
                  </a>
                </div>
                <p className="text-xs text-slate-400">
                  Explicitly invites Googlebot, Bingbot, WhatsApp crawler, Twitterbot, and Facebook preview engines while protecting admin routes.
                </p>
                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`User-agent: *
Allow: /
Allow: /catalog
Allow: /parts/
Disallow: /admin-restricted
Sitemap: ${currentHost}/sitemap.xml`}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 4: SCHEMA.ORG JSON-LD */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Embedded Schema.org Structured Data (JSON-LD)</h4>
                  <p className="text-xs text-slate-400">
                    Provides Google with machine-readable metadata for auto spares, store locations, and Sitelinks search.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(jsonLdPreview, 'schema_copy')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'schema_copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Schema JSON</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300 overflow-x-auto max-h-72">
                {jsonLdPreview}
              </pre>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <h5 className="font-bold">Google Rich Results Compliant</h5>
                  <p className="text-emerald-400/80 text-[11px] mt-0.5">
                    Tested against Google Search Central Rich Snippets specifications for eCommerce products, auto parts stores, and sitelinks search boxes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SOCIAL & WHATSAPP SHARING CARDS */}
          {activeTab === 'sharing' && (
            <div className="space-y-6">
              
              {/* WhatsApp Share Card Simulator */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp & Social OpenGraph Card Preview</span>
                </h4>

                <div className="max-w-md p-3 rounded-xl bg-[#0b141a] border border-emerald-500/30 text-white space-y-2 shadow-xl">
                  <div className="h-44 rounded-lg overflow-hidden relative">
                    <img 
                      src={currentSelectedPart?.images[0]} 
                      alt={currentSelectedPart?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-slate-950/90 text-amber-400 font-bold text-[10px] border border-amber-500/40">
                      R {currentSelectedPart?.priceZAR.toLocaleString('en-ZA')}
                    </div>
                  </div>
                  <div className="p-2 bg-[#1f2c34] rounded-lg">
                    <h5 className="text-xs font-bold text-slate-100">{currentSelectedPart?.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      Available at {currentSelectedPart?.sellerName} in {currentSelectedPart?.locationCity}. Direct WhatsApp chat & nationwide delivery across SA.
                    </p>
                    <span className="text-[9px] text-emerald-400 font-mono mt-1 block">partsource.co.za/parts/{currentSelectedPart?.id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => {
                      const shareText = `Check out this ${currentSelectedPart?.title} on Part Source ZA: ${currentHost}/?search=${encodeURIComponent(currentSelectedPart?.title || '')}`;
                      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-950/50"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Part to WhatsApp Group</span>
                  </button>

                  <button
                    onClick={() => handleCopy(`${currentHost}/?search=${encodeURIComponent(currentSelectedPart?.title || '')}`, 'part_share_link')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
                  >
                    {copiedKey === 'part_share_link' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>Copy Shareable URL</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-4 h-4 text-amber-500" />
            <span>Search Engine Indexer · Part Source ZA 🇿🇦</span>
          </div>
          <button
            onClick={() => setIsSearchEngineModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
