import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Database, 
  Building2, 
  Package, 
  CreditCard, 
  Terminal, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Layers, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  FileText,
  Sliders,
  ExternalLink,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  UserPlus,
  ShoppingBag,
  Info,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  HelpCircle,
  KeyRound,
  Filter
} from 'lucide-react';
import { AppBankingDetails, SellerTier, UserRole, PlatformUser, Order } from '../types';
import { SUBSCRIPTION_PLANS, SA_PROVINCES, ROLE_PERMISSIONS_MATRIX } from '../data/mockData';

export const OwnerAdminDashboard: React.FC = () => {
  const { 
    listings, 
    sellers, 
    orders, 
    inquiries, 
    users,
    deleteListing, 
    updateListing, 
    setEditingListing, 
    setIsAddEditModalOpen,
    setSelectedListing,
    bankingDetails,
    updateBankingDetails,
    isDevApp,
    setIsDevApp,
    updateSellerSubscription,
    updateSellerStatus,
    updateUserStatus,
    updateUserRole,
    addUser,
    deleteUser,
    updateOrderStatus,
    updateOrderPaymentStatus,
    isAdminAuthenticated,
    authenticateAdmin,
    logoutAdmin,
    setRole,
    showNotification
  } = useApp();

  // Inline auth state for direct dashboard access
  const [inlinePassword, setInlinePassword] = useState('');
  const [showInlinePassword, setShowInlinePassword] = useState(false);
  const [inlineError, setInlineError] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'sellers' | 'transactions' | 'roles' | 'banking'>('overview');
  
  // Search & Filter states
  const [listingSearch, setListingSearch] = useState('');
  const [listingProvinceFilter, setListingProvinceFilter] = useState('');
  
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerTierFilter, setSellerTierFilter] = useState<string>('all');
  
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // New user modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'buyer' as UserRole,
    status: 'active' as const,
    province: 'Gauteng' as const,
    city: '',
    associatedBusinessName: '',
    notes: ''
  });

  // Editable banking details local form state
  const [bankForm, setBankForm] = useState<AppBankingDetails>(bankingDetails);
  const [isSavingBank, setIsSavingBank] = useState(false);

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Financial statistics
  const totalListingsValue = listings.reduce((acc, curr) => acc + curr.priceZAR * curr.stockCount, 0);
  const totalMonthlySubscriptionMRR = sellers.reduce((acc, curr) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === curr.subscriptionTier);
    return acc + (plan?.priceMonthlyZAR || 0);
  }, 0);
  const totalOrdersGTV = orders.reduce((acc, curr) => acc + curr.totalAmountZAR, 0);
  const buyersCount = users.filter(u => u.role === 'buyer').length;
  const sellersCount = users.filter(u => u.role === 'seller').length;
  const adminsCount = users.filter(u => u.role === 'admin' || u.role === 'owner').length;

  const handleBankFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDevApp) {
      showNotification('Access Denied', 'Banking configuration is only editable on the Dev App environment.', 'warning');
      return;
    }
    setIsSavingBank(true);
    updateBankingDetails(bankForm);
    setIsSavingBank(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      showNotification('Incomplete Form', 'Please provide at least a name and email.', 'warning');
      return;
    }
    addUser({
      name: newUserForm.name,
      email: newUserForm.email,
      phone: newUserForm.phone || '+27 11 000 0000',
      role: newUserForm.role,
      status: newUserForm.status,
      province: newUserForm.province,
      city: newUserForm.city || 'Johannesburg',
      associatedBusinessName: newUserForm.associatedBusinessName || undefined,
      ordersCount: 0,
      totalSpentZAR: 0,
      lastActive: 'Just now',
      notes: newUserForm.notes
    });
    setIsAddUserOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      phone: '',
      role: 'buyer',
      status: 'active',
      province: 'Gauteng',
      city: '',
      associatedBusinessName: '',
      notes: ''
    });
  };

  const handleInlineAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlinePassword.trim()) {
      setInlineError('Please enter administrator password.');
      return;
    }
    const success = authenticateAdmin(inlinePassword);
    if (!success) {
      setInlineError('Incorrect password. Access denied.');
      setInlinePassword('');
    } else {
      setInlineError('');
      setInlinePassword('');
    }
  };

  // If not authenticated as Admin, show lock barrier
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3.5 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Security Enforced
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                Admin Hub Protected
              </h2>
              <p className="text-xs text-slate-400">
                Authentication required for platform authority
              </p>
            </div>
          </div>

          <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Administrator Access Required</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Enter the master password to access system settings, developer banking configurations, seller subscription management, and user permissions.
              </p>
            </div>
          </div>

          <form onSubmit={handleInlineAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showInlinePassword ? 'text' : 'password'}
                  value={inlinePassword}
                  onChange={(e) => {
                    setInlinePassword(e.target.value);
                    if (inlineError) setInlineError('');
                  }}
                  placeholder="Enter administrator password..."
                  className={`w-full pl-4 pr-11 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    inlineError
                      ? 'border-red-500/80 focus:ring-2 focus:ring-red-500/30'
                      : 'border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowInlinePassword(!showInlinePassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  title={showInlinePassword ? 'Hide password' : 'Show password'}
                >
                  {showInlinePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {inlineError && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{inlineError}</span>
                </p>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Back to Marketplace
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Hub</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Encrypted Session
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Role: Master Super Admin
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Super Admin Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                    Part Source ZA • Platform Owner & Admin Hub
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
                    Full Data Access
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete authority over Users, Scrap Yards, Inventory Listings, Transactions, Subscriptions, and Secure Dev App Banking.
                </p>
              </div>
            </div>

            {/* Action Buttons: Dev App Indicator & Lock Session */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Dev App Toggle */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`h-2.5 w-2.5 rounded-full ${isDevApp ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`}></span>
                  <span className="font-semibold text-slate-300">
                    {isDevApp ? 'Dev Context (Unlocked)' : 'Production (Locked)'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const nextState = !isDevApp;
                    setIsDevApp(nextState);
                    showNotification('Dev Mode Toggled', nextState ? 'Dev environment banking configuration unlocked.' : 'Production security lock applied.', 'info');
                  }}
                  className="text-[10px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold uppercase tracking-wider rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  {isDevApp ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>Toggle Dev Mode</span>
                </button>
              </div>

              {/* Secure Lock Admin Session Button */}
              <button
                onClick={logoutAdmin}
                className="px-3.5 py-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-sm hover:border-red-500/50"
                title="Lock Administrator Hub and return to Marketplace"
              >
                <Lock className="w-4 h-4 text-red-400" />
                <span>Lock Session</span>
              </button>

            </div>

          </div>

          {/* Master Platform KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            
            {/* Total Platform MRR */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                Monthly Subscriptions MRR
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </span>
              <p className="text-2xl font-light text-emerald-400 mt-2 font-mono">
                {formatZAR(totalMonthlySubscriptionMRR)}
              </p>
              <span className="text-[10px] text-slate-500">{sellers.length} active paying suppliers</span>
            </div>

            {/* Total Active Inventory Value */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                Total Catalog Gross Value
                <Package className="w-3.5 h-3.5 text-amber-500" />
              </span>
              <p className="text-2xl font-light text-white mt-2 font-mono">
                {formatZAR(totalListingsValue)}
              </p>
              <span className="text-[10px] text-slate-500">{listings.length} live parts across SA</span>
            </div>

            {/* Total Orders GTV */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                Orders Volume (GTV)
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              </span>
              <p className="text-2xl font-light text-blue-400 mt-2 font-mono">
                {formatZAR(totalOrdersGTV)}
              </p>
              <span className="text-[10px] text-slate-500">{orders.length} platform transactions</span>
            </div>

            {/* Total Platform Registered Users */}
            <div 
              onClick={() => setActiveTab('users')}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl cursor-pointer hover:border-amber-500/50 transition-colors"
            >
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                Registered Users (RBAC)
                <Users className="w-3.5 h-3.5 text-purple-400" />
              </span>
              <p className="text-2xl font-light text-purple-300 mt-2 font-mono">
                {users.length}
              </p>
              <span className="text-[10px] text-slate-500">
                {buyersCount} Buyers • {sellersCount} Sellers • {adminsCount} Admins
              </span>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6 border-t border-slate-800 pt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Users & Roles ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'listings' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>All Listings ({listings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sellers' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Sellers & Subscriptions ({sellers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'transactions' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Transactions & Leads ({orders.length + inquiries.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'roles' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Roles & Permissions Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('banking')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'banking' 
                  ? 'bg-amber-500 text-slate-950 font-black' 
                  : 'bg-slate-950 text-amber-400 hover:bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Dev Banking Settings {isDevApp ? '(Unlocked)' : '(Dev Only)'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* TAB 1: Database Overview */}
      {activeTab === 'overview' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Actions Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Admin Quick Controls & Master Operations
              </h3>

              <div className="space-y-3 text-xs">
                <button
                  onClick={() => {
                    setEditingListing(null);
                    setIsAddEditModalOpen(true);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-left font-semibold flex items-center justify-between transition-colors"
                >
                  <span>+ Create Listing on Behalf of Any Supplier</span>
                  <Package className="w-4 h-4 text-amber-400" />
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-left font-semibold flex items-center justify-between transition-colors"
                >
                  <span>Manage Platform User Accounts & Assign Roles</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </button>

                <button
                  onClick={() => setActiveTab('sellers')}
                  className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-left font-semibold flex items-center justify-between transition-colors"
                >
                  <span>Moderate & Upgrade Seller Subscription Tiers</span>
                  <Building2 className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => setActiveTab('banking')}
                  className="w-full p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-left font-semibold flex items-center justify-between transition-colors"
                >
                  <span>Configure App Bank Account for Seller Subscriptions & EFT</span>
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Live Banking Snapshot */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Official Receiving Bank Details
                </h3>
                <span className={`text-[11px] font-mono font-bold ${isDevApp ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isDevApp ? 'Dev Context: Editable' : 'Protected Mode'}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank:</span>
                  <span className="font-bold text-white">{bankingDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Holder:</span>
                  <span className="font-bold text-slate-200">{bankingDetails.accountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="font-mono font-bold text-amber-400">{bankingDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Branch Code:</span>
                  <span className="font-mono text-slate-300">{bankingDetails.branchCode} ({bankingDetails.branchName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VAT Reg:</span>
                  <span className="font-mono text-slate-300">{bankingDetails.vatRegistrationNumber}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Last modified: {new Date(bankingDetails.lastUpdated).toLocaleDateString('en-ZA')} by {bankingDetails.updatedBy}
                </span>
                <button
                  onClick={() => setActiveTab('banking')}
                  className="text-amber-400 hover:text-amber-300 font-bold underline text-xs"
                >
                  Edit in Dev Settings →
                </button>
              </div>
            </div>

          </div>

          {/* Summary Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* User Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>User Roles Breakdown</span>
                <Users className="w-4 h-4 text-purple-400" />
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">Buyers (Search & Purchase)</span>
                  <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{buyersCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">Sellers (Scrap Yards & Dismantlers)</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{sellersCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">Admins & Platform Owners</span>
                  <span className="font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{adminsCount}</span>
                </div>
              </div>
            </div>

            {/* Inventory Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Inventory Provinces</span>
                <MapPin className="w-4 h-4 text-amber-400" />
              </h4>
              <div className="space-y-2 text-xs">
                {SA_PROVINCES.slice(0, 3).map(prov => {
                  const count = listings.filter(l => l.locationProvince === prov).length;
                  return (
                    <div key={prov} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-300">{prov}</span>
                      <span className="font-mono font-bold text-white">{count} parts</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Subscription Tiers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Supplier Subscriptions</span>
                <Building2 className="w-4 h-4 text-emerald-400" />
              </h4>
              <div className="space-y-2 text-xs">
                {SUBSCRIPTION_PLANS.map(plan => {
                  const count = sellers.filter(s => s.subscriptionTier === plan.id).length;
                  return (
                    <div key={plan.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-300">{plan.name} (R{plan.priceMonthlyZAR}/mo)</span>
                      <span className="font-mono font-bold text-emerald-400">{count} yards</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: All Users & RBAC Roles */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* Top User Controls & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name, email, phone, or company..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Roles (Buyer, Seller, Admin)</option>
                <option value="buyer">Buyers Only</option>
                <option value="seller">Sellers Only</option>
                <option value="admin">Admins Only</option>
              </select>

              {/* Status Filter */}
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
                <option value="pending_verification">Pending Verification</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New User</span>
            </button>
          </div>

          {/* User Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">User Name & Contact</th>
                    <th className="py-3.5 px-4">Role & Privileges</th>
                    <th className="py-3.5 px-4">Location / Business</th>
                    <th className="py-3.5 px-4">Activity & Spend</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users
                    .filter(u => {
                      const matchesSearch = 
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.phone.toLowerCase().includes(userSearch.toLowerCase()) ||
                        (u.associatedBusinessName && u.associatedBusinessName.toLowerCase().includes(userSearch.toLowerCase()));
                      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                      const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
                      return matchesSearch && matchesRole && matchesStatus;
                    })
                    .map(user => (
                      <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* Name & Contact */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            {user.name}
                            {user.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-500/20 text-red-300 border border-red-500/40">
                                OWNER/ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {user.email} • {user.phone}
                          </div>
                        </td>

                        {/* Role Dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              user.role === 'admin'
                                ? 'bg-red-950/60 border-red-500/40 text-red-300'
                                : user.role === 'seller'
                                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                                : 'bg-slate-800 border-slate-700 text-slate-200'
                            }`}
                          >
                            <option value="buyer">Buyer (Search & Buy)</option>
                            <option value="seller">Seller (Manage Inventory)</option>
                            <option value="admin">Admin (Full Control)</option>
                          </select>
                        </td>

                        {/* Location / Business */}
                        <td className="py-3 px-4">
                          <div className="text-slate-200 font-medium">{user.city}, {user.province}</div>
                          {user.associatedBusinessName && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              🏢 {user.associatedBusinessName}
                            </div>
                          )}
                        </td>

                        {/* Activity & Spend */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-300 text-[11px]">
                            {user.ordersCount} orders • {formatZAR(user.totalSpentZAR)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Active: {user.lastActive} (Joined {user.joinedDate})
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              const nextStatus = user.status === 'active' ? 'suspended' : 'active';
                              updateUserStatus(user.id, nextStatus);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              user.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : user.status === 'suspended'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                            title="Click to toggle status"
                          >
                            {user.status.toUpperCase()}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(user.name)},%20message%20from%20Part%20Source%20ZA%20Platform%20Owner...`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                              title="WhatsApp User"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete user "${user.name}" permanently?`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Register User Modal */}
          {isAddUserOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  Register Platform User
                </h3>

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Johan Steyn"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="johan@example.co.za"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+27 82 123 4567"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Assigned Role</label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="buyer">Buyer (Search & Buy)</option>
                        <option value="seller">Seller (Inventory Manager)</option>
                        <option value="admin">Admin (Full Control)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Province</label>
                      <select
                        value={newUserForm.province}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, province: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {SA_PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Associated Business / Yard Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Pretoria Auto Dismantlers"
                      value={newUserForm.associatedBusinessName}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, associatedBusinessName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: All Listings Master (Full Data Access & CRUD on any item) */}
      {activeTab === 'listings' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search across all suppliers' inventory..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <select
                value={listingProvinceFilter}
                onChange={(e) => setListingProvinceFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">All 9 Provinces</option>
                {SA_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">
                Showing {listings.length} total active database records
              </span>
              <button
                onClick={() => {
                  setEditingListing(null);
                  setIsAddEditModalOpen(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
              >
                <Package className="w-4 h-4" />
                <span>+ Create Listing</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Part Title & Vehicle</th>
                    <th className="py-3 px-4">Supplier / Scrapyard</th>
                    <th className="py-3 px-4">SKU / OEM</th>
                    <th className="py-3 px-4">Price (ZAR)</th>
                    <th className="py-3 px-4">Province</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Admin Actions (Full CRUD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {listings
                    .filter(l => {
                      const matchesSearch = 
                        l.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
                        l.sellerName.toLowerCase().includes(listingSearch.toLowerCase()) ||
                        l.partNumber.toLowerCase().includes(listingSearch.toLowerCase());
                      const matchesProvince = !listingProvinceFilter || l.locationProvince === listingProvinceFilter;
                      return matchesSearch && matchesProvince;
                    })
                    .map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="h-10 w-12 rounded object-cover bg-slate-950 border border-slate-800 cursor-pointer"
                              onClick={() => setSelectedListing(item)}
                            />
                            <div>
                              <span 
                                onClick={() => setSelectedListing(item)}
                                className="font-bold text-white hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
                              >
                                {item.title}
                              </span>
                              <span className="text-[11px] text-slate-400 block font-mono">
                                {item.make} {item.model} ({item.yearStart}-{item.yearEnd})
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-200 block">{item.sellerName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.sellerPhone}</span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                          {item.partNumber}
                        </td>

                        <td className="py-3 px-4 font-bold text-white font-sans text-sm">
                          {formatZAR(item.priceZAR)}
                        </td>

                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          {item.locationProvince}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => updateListing(item.id, { isFeatured: !item.isFeatured })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              item.isFeatured ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500 hover:text-white'
                            }`}
                          >
                            {item.isFeatured ? '★ Featured' : 'Standard'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingListing(item);
                                setIsAddEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                              title="Owner Edit Listing"
                            >
                              <Edit3 className="w-4 h-4 text-amber-400" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`SUPERADMIN ACTION: Permanently remove "${item.title}"?`)) {
                                  deleteListing(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-400 transition-colors"
                              title="Owner Delete Listing"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: All Sellers & Subscriptions Management */}
      {activeTab === 'sellers' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search scrap yards by name, city, or registration..."
                  value={sellerSearch}
                  onChange={(e) => setSellerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <select
                value={sellerTierFilter}
                onChange={(e) => setSellerTierFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Subscription Plans</option>
                <option value="starter">Starter (R299/mo)</option>
                <option value="pro">Pro (R699/mo)</option>
                <option value="enterprise">Enterprise (R1,499/mo)</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Managing {sellers.length} certified South African auto dismantlers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellers
              .filter(s => {
                const matchesSearch = 
                  s.businessName.toLowerCase().includes(sellerSearch.toLowerCase()) ||
                  s.city.toLowerCase().includes(sellerSearch.toLowerCase()) ||
                  s.registrationNumber.toLowerCase().includes(sellerSearch.toLowerCase());
                const matchesTier = sellerTierFilter === 'all' || s.subscriptionTier === sellerTierFilter;
                return matchesSearch && matchesTier;
              })
              .map(seller => {
                const sellerParts = listings.filter(l => l.sellerId === seller.id);
                const plan = SUBSCRIPTION_PLANS.find(p => p.id === seller.subscriptionTier);

                return (
                  <div key={seller.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                          {seller.businessName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {seller.businessName}
                            {seller.verified && (
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {seller.city}, {seller.province} • Contact: {seller.contactPerson}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                        {seller.subscriptionTier}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-4 text-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Live Parts</span>
                        <span className="font-bold text-white font-mono">{sellerParts.length} / {plan?.listingLimit}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Monthly Fee</span>
                        <span className="font-bold text-emerald-400 font-sans">R{plan?.priceMonthlyZAR || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Status</span>
                        <span className="font-bold text-emerald-300 uppercase text-[10px]">{seller.subscriptionStatus}</span>
                      </div>
                    </div>

                    {/* Owner Subscription Management Controls */}
                    <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-[10px] block mb-1">Subscription Plan:</label>
                          <select
                            value={seller.subscriptionTier}
                            onChange={(e) => updateSellerSubscription(seller.id, e.target.value as SellerTier)}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                          >
                            <option value="starter">Starter (R299/mo - 15 listings)</option>
                            <option value="pro">Pro (R699/mo - 75 listings)</option>
                            <option value="enterprise">Enterprise (R1,499/mo - 500 listings)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-400 text-[10px] block mb-1">Billing Status:</label>
                          <select
                            value={seller.subscriptionStatus}
                            onChange={(e) => updateSellerStatus(seller.id, e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                          >
                            <option value="active">Active (Paid)</option>
                            <option value="trial">Free Trial (14-Day)</option>
                            <option value="past_due">Past Due (Suspended)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={seller.verified}
                            onChange={(e) => updateSellerStatus(seller.id, seller.subscriptionStatus, e.target.checked)}
                            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                          />
                          <span>Verified Supplier Shield</span>
                        </label>

                        <a
                          href={`https://wa.me/${seller.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(seller.businessName)},%20message%20from%20Part%20Source%20ZA%20Platform%20Owner...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded font-semibold text-[11px] transition-colors"
                        >
                          WhatsApp Direct
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 5: Transactions & Orders Master */}
      {activeTab === 'transactions' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          
          {/* Orders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Platform Customer Orders Ledger</h3>
                <p className="text-[11px] text-slate-400">Audit all customer orders, delivery destinations, and payment statuses nationwide.</p>
              </div>
              <span className="font-mono text-xs text-blue-400 font-bold">
                Total Orders GTV: {formatZAR(totalOrdersGTV)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Component</th>
                    <th className="py-3 px-4">Buyer Details</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{o.id}</td>
                      <td className="py-3 px-4 text-white font-semibold">{o.partTitle}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{o.buyerName}</div>
                        <div className="text-[10px] text-slate-400">{o.buyerPhone} • {o.province}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{o.sellerName}</td>
                      <td className="py-3 px-4 font-bold text-white font-sans">{formatZAR(o.totalAmountZAR)}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{o.paymentMethod}</td>
                      
                      {/* Payment Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={o.paymentStatus || 'paid'}
                          onChange={(e) => updateOrderPaymentStatus(o.id, e.target.value as any)}
                          className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-[10px] font-bold text-emerald-300"
                        >
                          <option value="paid">PAID (Verified)</option>
                          <option value="pending_verification">Pending POP / Verification</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </td>

                      {/* Order Status Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                          className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-[10px] font-bold text-blue-300"
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="dispatched">DISPATCHED</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Buyer Inquiries & WhatsApp Leads Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Buyer Quote Inquiries & Lead Log ({inquiries.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Inquiry ID</th>
                    <th className="py-3 px-4">Part Title</th>
                    <th className="py-3 px-4">Buyer Info</th>
                    <th className="py-3 px-4">Target Supplier</th>
                    <th className="py-3 px-4">Message / Compatibility Note</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {inquiries.map(inq => (
                    <tr key={inq.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{inq.id}</td>
                      <td className="py-3 px-4 text-white font-semibold">{inq.partTitle}</td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-bold">{inq.buyerName}</div>
                        <div className="text-[10px] text-slate-400">{inq.buyerPhone} • {inq.buyerEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{inq.sellerName}</td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{inq.message}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                        {new Date(inq.createdAt).toLocaleDateString('en-ZA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: Roles & Permissions Matrix Specification */}
      {activeTab === 'roles' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Part Source ZA • Role-Based Access Control (RBAC) Architecture
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formal specification of user roles and security boundaries across the platform.
                </p>
              </div>
            </div>

            {/* 3 Core Roles Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              
              {/* Buyer Role */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    ROLE: BUYER
                  </span>
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Motorists & Fleet Managers</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Individual car owners, workshop mechanics, and corporate fleet buyers searching for South African spare parts.
                </p>
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Search, compare, request & purchase parts
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Direct WhatsApp chat with scrap yards
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> No listing creation or supplier edit rights
                  </div>
                </div>
              </div>

              {/* Seller Role */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ROLE: SELLER
                  </span>
                  <Building2 className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Scrap Yards & Spares Dealers</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Verified automotive dismantlers and spares shops managing inventory and advertising spare parts.
                </p>
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Create, edit, price & manage own listings
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Manage subscription plan (Starter/Pro/Enterprise)
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Cannot modify other yards or app bank details
                  </div>
                </div>
              </div>

              {/* Admin Role */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                    ROLE: ADMIN / OWNER
                  </span>
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Platform Owner & Core Team</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  SuperAdmin with absolute data governance across users, listings, transactions, and developer banking.
                </p>
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Full data access & master CRUD across all data
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Manage seller subscriptions & verify suppliers
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Update app receiving bank details (Dev Mode)
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Detailed Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Granular Permissions Matrix by Application Module
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 w-1/4">Module / Capability</th>
                    <th className="py-3.5 px-4 w-1/3">Permission Description</th>
                    <th className="py-3.5 px-3 text-center">Buyer</th>
                    <th className="py-3.5 px-3 text-center">Seller</th>
                    <th className="py-3.5 px-3 text-center">Admin / Owner</th>
                    <th className="py-3.5 px-4">Security Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {ROLE_PERMISSIONS_MATRIX.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{item.module}</td>
                      <td className="py-3 px-4 text-slate-300 text-[11px]">{item.description}</td>
                      
                      {/* Buyer */}
                      <td className="py-3 px-3 text-center">
                        {item.buyer ? (
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Seller */}
                      <td className="py-3 px-3 text-center">
                        {item.seller ? (
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Admin */}
                      <td className="py-3 px-3 text-center">
                        {item.admin ? (
                          <span className="inline-flex items-center justify-center p-1 rounded-full bg-amber-500/20 text-amber-400">
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-xs">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[10px] text-slate-400 font-mono">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 7: Dev App Banking Settings (Secure Developer Settings) */}
      {activeTab === 'banking' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* Dev Environment Notice Box */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-300">
                  Dev App Banking Configuration Panel
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 uppercase">
                  Dev Environment Exclusive
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                As per system architecture specifications, <strong>App Official Receiving Banking Details</strong> can only be configured by the owner in the Dev App environment. These details are used to receive monthly seller subscription fees (Starter R299, Pro R699, Enterprise R1,499) and direct buyer EFT transactions.
              </p>
              {!isDevApp && (
                <div className="mt-3 p-2.5 bg-red-950/80 border border-red-600/60 rounded-xl text-xs text-red-200 flex items-center justify-between">
                  <span>⚠️ Currently in locked mode. Click "Unlock Dev Mode" to modify.</span>
                  <button
                    onClick={() => setIsDevApp(true)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Unlock Dev Mode
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bank Configuration Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  Part Source ZA Official Receiving Bank Details
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modifying these records immediately updates the seller subscription invoices and checkout EFT payment modal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                  isDevApp ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isDevApp ? 'STATUS: DEV WRITE PERMITTED' : 'STATUS: READ ONLY'}
                </span>
              </div>
            </div>

            <form onSubmit={handleBankFormSubmit} className="space-y-5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Bank Name */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Receiving Bank Name *
                  </label>
                  <select
                    disabled={!isDevApp}
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    <option value="First National Bank (FNB)">First National Bank (FNB)</option>
                    <option value="Standard Bank of South Africa">Standard Bank of South Africa</option>
                    <option value="Nedbank Limited">Nedbank Limited</option>
                    <option value="Capitec Business Bank">Capitec Business Bank</option>
                    <option value="Absa Corporate Bank">Absa Corporate Bank</option>
                    <option value="Investec Bank Limited">Investec Bank Limited</option>
                  </select>
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Account Holder Legal Entity *
                  </label>
                  <input
                    type="text"
                    disabled={!isDevApp}
                    required
                    value={bankForm.accountHolder}
                    onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium disabled:opacity-50"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    disabled={!isDevApp}
                    required
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  />
                </div>

                {/* Branch Code */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Universal / Branch Code *
                  </label>
                  <input
                    type="text"
                    disabled={!isDevApp}
                    required
                    value={bankForm.branchCode}
                    onChange={(e) => setBankForm(prev => ({ ...prev, branchCode: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  />
                </div>

                {/* Branch Name */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    disabled={!isDevApp}
                    value={bankForm.branchName}
                    onChange={(e) => setBankForm(prev => ({ ...prev, branchName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Account Type
                  </label>
                  <select
                    disabled={!isDevApp}
                    value={bankForm.accountType}
                    onChange={(e: any) => setBankForm(prev => ({ ...prev, accountType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    <option value="Business Cheque">Business Cheque Account</option>
                    <option value="Current Account">Commercial Current Account</option>
                    <option value="Corporate Transmission">Corporate Transmission Account</option>
                  </select>
                </div>

                {/* SWIFT Code */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    SWIFT / BIC Code (International)
                  </label>
                  <input
                    type="text"
                    disabled={!isDevApp}
                    value={bankForm.swiftCode}
                    onChange={(e) => setBankForm(prev => ({ ...prev, swiftCode: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  />
                </div>

                {/* VAT Number */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    SARS VAT Registration Number
                  </label>
                  <input
                    type="text"
                    disabled={!isDevApp}
                    value={bankForm.vatRegistrationNumber}
                    onChange={(e) => setBankForm(prev => ({ ...prev, vatRegistrationNumber: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  />
                </div>

              </div>

              {/* Payment Reference Format & Seller Notice */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    EFT Payment Reference Prefix / Template
                  </label>
                  <input
                    type="text"
                    disabled={!isDevApp}
                    value={bankForm.referenceFormat}
                    onChange={(e) => setBankForm(prev => ({ ...prev, referenceFormat: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Notice & Instructions Shown to Monthly Seller Subscribers
                  </label>
                  <textarea
                    rows={3}
                    disabled={!isDevApp}
                    value={bankForm.sellerFeeNotice}
                    onChange={(e) => setBankForm(prev => ({ ...prev, sellerFeeNotice: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs disabled:opacity-50 leading-relaxed"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-slate-400 text-[11px]">
                  Last synced: {new Date(bankingDetails.lastUpdated).toLocaleString('en-ZA')}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBankForm(bankingDetails)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Discard Changes
                  </button>

                  <button
                    type="submit"
                    disabled={!isDevApp || isSavingBank}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save App Banking Details (Dev)</span>
                  </button>
                </div>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};
