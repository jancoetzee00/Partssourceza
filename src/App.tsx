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
import { AdminAuthModal } from './components/AdminAuthModal';
import { CheckCircle2, AlertCircle, Info, Car, Heart, ShieldCheck, Download, Smartphone, Monitor } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role, activeNotification, setIsInstallModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Global Navigation */}
      <Header />

      {/* Main Role-based View */}
      <main className="flex-1">
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

      {/* Floating Direct WhatsApp Widget */}
      <WhatsAppQuickWidget />

      {/* Toast Notification Container */}
      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`rounded-2xl p-4 shadow-2xl border flex items-start gap-3 max-w-sm backdrop-blur-xl ${
            activeNotification.type === 'warning'
              ? 'bg-red-950/90 border-red-500/50 text-red-100 shadow-red-950/50'
              : activeNotification.type === 'info'
              ? 'bg-slate-900/90 border-blue-500/50 text-slate-100 shadow-black/80'
              : 'bg-slate-900/95 border-amber-500/50 text-slate-100 shadow-black/80'
          }`}>
            {activeNotification.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            ) : activeNotification.type === 'info' ? (
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h5 className="text-xs font-bold text-white">{activeNotification.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {activeNotification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">
              PS
            </div>
            <span className="font-extrabold text-slate-200">PART SOURCE ZA 🇿🇦</span>
            <span className="text-slate-600">|</span>
            <span>South Africa Car & Truck Spares Advertising Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
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
