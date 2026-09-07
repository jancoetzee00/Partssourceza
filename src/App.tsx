/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BuyerCatalog } from './components/BuyerCatalog';
import { SellerDashboard } from './components/SellerDashboard';
import { OwnerAdminDashboard } from './components/OwnerAdminDashboard';
import { PartDetailsModal } from './components/PartDetailsModal';
import { PartCompareModal } from './components/PartCompareModal';
import { AddEditListingModal } from './components/AddEditListingModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { CheckoutModal } from './components/CheckoutModal';
import { PartRequestModal } from './components/PartRequestModal';
import { InstallAppModal } from './components/InstallAppModal';
import { WhatsAppDirectModal } from './components/WhatsAppDirectModal';
import { WhatsAppQuickWidget } from './components/WhatsAppQuickWidget';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminAuthModal } from './components/AdminAuthModal';
import { SearchEngineExposureModal } from './components/SearchEngineExposureModal';
import { BulkInventoryModal } from './components/BulkInventoryModal';
import { WebLinkShareModal } from './components/WebLinkShareModal';
import { SellerAuthModal } from './components/SellerAuthModal';
import { MarketingStrategyModal } from './components/MarketingStrategyModal';
import { ClientOutreachModal } from './components/ClientOutreachModal';
import { CheckCircle2, AlertCircle, Info, Car, Heart, ShieldCheck, Download, Smartphone, Monitor, Globe, Share2, Link as LinkIcon, X, Sparkles, Users, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const { 
    role, 
    activeNotification, 
    dismissNotification, 
    setIsInstallModalOpen, 
    setIsSearchEngineModalOpen, 
    setIsWebLinkModalOpen,
    openMarketingHub,
    openClientOutreach 
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Global Navigation */}
      <Header />

      {/* Main Role-based View */}
      <main className="flex-1 pb-20 md:pb-0">
        {role === 'buyer' && <BuyerCatalog />}
        {role === 'seller' && <SellerDashboard />}
        {(role === 'owner' || role === 'admin') && <OwnerAdminDashboard />}
      </main>

      {/* Global Modals */}
      <PartDetailsModal />
      <PartCompareModal />
      <AddEditListingModal />
      <SubscriptionModal />
      <CheckoutModal />
      <PartRequestModal />
      <InstallAppModal />
      <WhatsAppDirectModal />
      <AdminAuthModal />
      <SearchEngineExposureModal />
      <BulkInventoryModal />
      <WebLinkShareModal />
      <SellerAuthModal />
      <MarketingStrategyModal />
      <ClientOutreachModal />

      {/* Floating Direct WhatsApp Widget */}
      <WhatsAppQuickWidget />

      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Swipeable Toast Notification Container */}
      <AnimatePresence mode="wait">
        {activeNotification && (
          <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 flex justify-center sm:justify-end pointer-events-none">
            <motion.div
              key={`${activeNotification.title}-${activeNotification.message}`}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 140, scale: 0.88, transition: { duration: 0.2 } }}
              drag="x"
              dragDirectionLock={true}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              onDragEnd={(_, info) => {
                // If swiped horizontally with threshold velocity or distance, dismiss toast
                if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 300) {
                  dismissNotification();
                }
              }}
              whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
              className={`pointer-events-auto cursor-grab active:cursor-grabbing select-none rounded-2xl p-4 shadow-2xl border flex items-start gap-3 max-w-sm w-full sm:w-auto backdrop-blur-xl transition-colors relative touch-pan-y ${
                activeNotification.type === 'warning'
                  ? 'bg-red-950/95 border-red-500/50 text-red-100 shadow-red-950/50'
                  : activeNotification.type === 'info'
                  ? 'bg-slate-900/95 border-blue-500/50 text-slate-100 shadow-black/80'
                  : 'bg-slate-900/95 border-amber-500/50 text-slate-100 shadow-black/80'
              }`}
            >
              {/* Subtle top drag pill handle for touch devices */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-600/60 rounded-full sm:hidden" />

              {activeNotification.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : activeNotification.type === 'info' ? (
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1 pr-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-bold text-white truncate">{activeNotification.title}</h5>
                  <span className="text-[9px] text-slate-500 hidden sm:inline-block font-medium tracking-tight">swipe to dismiss ➔</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">
                  {activeNotification.message}
                </p>
                <div className="flex items-center justify-between gap-1 mt-1 text-[9px] text-slate-400/80 font-mono sm:hidden">
                  <span>← swipe left or right to dismiss →</span>
                </div>
              </div>

              <button
                type="button"
                onClick={dismissNotification}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-8 pb-24 md:pb-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">
              PS
            </div>
            <span className="font-extrabold text-slate-200">PART SOURCE ZA 🇿🇦</span>
            <span className="text-slate-600">|</span>
            <span>South Africa Car & Truck Spares Advertising Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
            <button
              onClick={() => openClientOutreach()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/25 via-amber-600/35 to-emerald-600/25 hover:from-amber-500/35 hover:to-emerald-600/35 text-amber-300 border border-amber-500/60 transition-all font-bold shadow-sm cursor-pointer"
              title="AI Search Prospective Clients & Send Direct WhatsApp / Email Messages"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Client Outreach & Messaging</span>
            </button>

            <button
              onClick={() => openMarketingHub('sellers')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-300 border border-amber-500/50 transition-all font-bold shadow-sm cursor-pointer"
              title="AI Marketing Engine (Get Sellers to List & Buyers to Discover)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Growth Strategy</span>
            </button>

            <button
              onClick={() => setIsWebLinkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-medium shadow-sm"
              title="Share Search Link & QR Generator (partssource.co.za)"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Web Link & Search Share</span>
            </button>

            <button
              onClick={() => setIsSearchEngineModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors font-semibold"
              title="Search Engine & Web Exposure Indexer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Search Engine & SEO Hub</span>
            </button>

            <a
              href="mailto:partssource-za@outlook.com"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border border-slate-700 hover:border-amber-500/50 transition-colors font-medium shadow-sm"
              title="Primary Platform Email: partssource-za@outlook.com"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>partssource-za@outlook.com</span>
            </a>

            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Mobile & Desktop App</span>
            </button>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Local Suppliers
            </span>
            <span className="text-slate-500 hidden md:inline">Johannesburg • Cape Town • Durban • Pretoria</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
