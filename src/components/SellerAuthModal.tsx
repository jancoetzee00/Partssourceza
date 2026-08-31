import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Store, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Flame, 
  Tag, 
  ArrowRight, 
  Layers, 
  Search, 
  Check, 
  Zap, 
  Star,
  Lock,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, SA_PROVINCES } from '../data/mockData';
import { SellerTier, SouthAfricanProvince } from '../types';

export const SellerAuthModal: React.FC = () => {
  const {
    isSellerAuthModalOpen,
    setIsSellerAuthModalOpen,
    sellerAuthMode,
    setSellerAuthMode,
    sellers,
    currentSeller,
    loginSeller,
    loginSellerByCredentials,
    registerNewSeller,
    subscriptionDiscounts,
    validateAndApplyPromoCode,
    showNotification
  } = useApp();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [sellerSearchFilter, setSellerSearchFilter] = useState('');

  // Registration form state
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [province, setProvince] = useState<SouthAfricanProvince>('Gauteng');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [selectedPlanTier, setSelectedPlanTier] = useState<SellerTier>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Promo code in registration
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoSavingsZAR, setPromoSavingsZAR] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isSellerAuthModalOpen) return null;

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanTier) || SUBSCRIPTION_PLANS[1];

  const handleApplyPromo = (codeToApply = promoCodeInput) => {
    setPromoError(null);
    setPromoMessage(null);
    const res = validateAndApplyPromoCode(codeToApply, selectedPlanTier);
    if (res.valid && res.discount) {
      setAppliedPromo(res.discount);
      setPromoSavingsZAR(res.discountAmountZAR || 0);
      setPromoMessage(res.message || 'Special promo applied!');
      setPromoCodeInput(res.discount.code);
      showNotification('Voucher Applied', res.message || 'Discount applied to new seller subscription.', 'success');
    } else {
      setAppliedPromo(null);
      setPromoSavingsZAR(0);
      setPromoError(res.message || 'Invalid or expired voucher code.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      showNotification('Input Required', 'Please enter your registered email, phone number, or business name.', 'warning');
      return;
    }
    const res = loginSellerByCredentials(loginIdentifier, loginPin);
    if (res.success) {
      setLoginIdentifier('');
      setLoginPin('');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      showNotification('Required Field', 'Please enter your Scrap Yard or Business name.', 'warning');
      return;
    }
    if (!contactPerson.trim()) {
      showNotification('Required Field', 'Please enter a primary contact person name.', 'warning');
      return;
    }
    if (!phone.trim()) {
      showNotification('Required Field', 'Please provide a South African contact phone number.', 'warning');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showNotification('Required Field', 'Please provide a valid business email address.', 'warning');
      return;
    }
    if (!city.trim()) {
      showNotification('Required Field', 'Please enter the city/town where your scrap yard or shop is located.', 'warning');
      return;
    }

    registerNewSeller({
      businessName,
      registrationNumber: registrationNumber || undefined,
      contactPerson,
      email,
      phone,
      whatsapp: whatsapp || phone,
      province,
      city,
      address,
      subscriptionTier: selectedPlanTier,
      billingCycle,
      promoCode: appliedPromo?.code
    });

    // Reset form
    setBusinessName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setWhatsapp('');
    setCity('');
    setAddress('');
    setRegistrationNumber('');
  };

  // Filtered list of registered sellers for quick switch/login
  const filteredSellers = sellers.filter(s => 
    s.businessName.toLowerCase().includes(sellerSearchFilter.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(sellerSearchFilter.toLowerCase()) ||
    s.city.toLowerCase().includes(sellerSearchFilter.toLowerCase()) ||
    s.province.toLowerCase().includes(sellerSearchFilter.toLowerCase()) ||
    s.email.toLowerCase().includes(sellerSearchFilter.toLowerCase())
  );

  const calculateEffectivePrice = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    const basePrice = billingCycle === 'annual' && plan.priceAnnualMonthlyZAR 
      ? plan.priceAnnualMonthlyZAR 
      : plan.priceMonthlyZAR;
    
    if (appliedPromo && plan.id === selectedPlanTier) {
      if (appliedPromo.discountType === 'percentage') {
        return Math.max(0, Math.round(basePrice * (1 - appliedPromo.discountValue / 100)));
      } else if (appliedPromo.discountType === 'fixed_amount') {
        return Math.max(0, basePrice - appliedPromo.discountValue);
      }
    }
    return basePrice;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-inner">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Part Source ZA Seller Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  🇿🇦 SUPPLIER PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct WhatsApp leads, auto spares advertising & scrap yard inventory syndication
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSellerAuthModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Existing Subscriber Login vs New Seller Registration */}
        <div className="bg-slate-950/90 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setSellerAuthMode('login')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                sellerAuthMode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Existing Subscriber Login</span>
            </button>

            <button
              onClick={() => setSellerAuthMode('register')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                sellerAuthMode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Seller Registration & Plans</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-950/60 text-amber-300 text-[9px] font-extrabold uppercase">
                Join
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>0% Commission • Direct WhatsApp & Calls</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6 text-xs text-slate-300">
          
          {/* ===================== TAB 1: EXISTING SUBSCRIBER LOGIN ===================== */}
          {sellerAuthMode === 'login' ? (
            <div className="space-y-6">
              
              {/* Quick Credentials Sign In */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Sign in with Registered Details
                  </h3>
                </div>

                <form onSubmit={handleLoginSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Business Email, Cell Phone, or Yard Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. spares@gautengsparesworld.co.za or +27824591029"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      PIN / Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Verified Subscriber Directory (Instant 1-Click Switch / Access) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      Registered Scrap Yards & Supplier Accounts ({sellers.length})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Select your auto dismantler account below for immediate 1-click access to your inventory & leads dashboard.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={sellerSearchFilter}
                      onChange={(e) => setSellerSearchFilter(e.target.value)}
                      placeholder="Search scrap yards by name, city, province..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {filteredSellers.map(seller => {
                    const isCurrentlyActive = seller.id === currentSeller?.id;
                    const planInfo = SUBSCRIPTION_PLANS.find(p => p.id === seller.subscriptionTier) || SUBSCRIPTION_PLANS[0];
                    
                    return (
                      <div
                        key={seller.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isCurrentlyActive
                            ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-sm">
                              {seller.businessName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-white text-xs sm:text-sm">
                                  {seller.businessName}
                                </h4>
                                {seller.verified && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified Supplier" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {seller.city}, {seller.province} • {seller.phone}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            seller.subscriptionTier === 'enterprise' || seller.subscriptionTier === 'network'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : seller.subscriptionTier === 'pro'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {planInfo.badgeName.split(' ')[0]}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="text-[11px] text-slate-400">
                            <span className="text-white font-mono font-semibold">{seller.activeListingsCount}</span> spares listed • Tier: <span className="text-amber-400 font-semibold">{planInfo.name}</span>
                          </div>

                          <button
                            onClick={() => loginSeller(seller.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isCurrentlyActive
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200'
                            }`}
                          >
                            {isCurrentlyActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active Account</span>
                              </>
                            ) : (
                              <>
                                <span>Sign In Here</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Need to register link */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Don't have a registered scrap yard or spares shop account yet?{' '}
                  <button
                    onClick={() => setSellerAuthMode('register')}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Click here to register & choose your subscription plan →
                  </button>
                </p>
              </div>

            </div>
          ) : (

            /* ===================== TAB 2: NEW SELLER REGISTRATION & PLANS ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              
              {/* Step 1: Business Profile */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Automotive Scrap Yard & Supplier Details
                    </h3>
                  </div>
                  <span className="text-[11px] text-amber-400 font-semibold">South Africa Nationwide</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Business / Scrap Yard Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Pretoria Highveld Auto Salvage"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Primary Contact Person <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Gerhard van Zyl"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Cell / Business Phone <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +27 82 459 1029"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      WhatsApp Lead Number (For Instant Buyer Chats)
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="e.g. 27824591029 (Defaults to Phone)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Business Email Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sales@highveldautosalvage.co.za"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      CIPC Registration / Tax No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. 2021/849201/07"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Province <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value as SouthAfricanProvince)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {SA_PROVINCES.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      City / Suburb <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Boksburg, Johannesburg"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Physical Yard Address (For Buyer Collections & Courier Dispatches)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 42 Main Reef Road, Boksburg Industrial, Gauteng, 1459"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Subscription Plans & Pricing Selection */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Choose Supplier Subscription Plan & Pricing
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Zero commission on parts sold. Direct direct buyer contact via WhatsApp & phone.
                      </p>
                    </div>
                  </div>

                  {/* Billing cycle toggle */}
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        billingCycle === 'annual'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Annual</span>
                      <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-black">
                        SAVE 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUBSCRIPTION_PLANS.map(plan => {
                    const isSelected = plan.id === selectedPlanTier;
                    const effectivePrice = calculateEffectivePrice(plan);
                    
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanTier(plan.id)}
                        className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2.5 right-4 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                            ★ MOST POPULAR
                          </span>
                        )}
                        {plan.bestValue && (
                          <span className="absolute -top-2.5 right-4 bg-purple-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                            💎 MEGA VALUE
                          </span>
                        )}
                        {plan.isNew && (
                          <span className="absolute -top-2.5 right-4 bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                            ⚡ NEW NETWORK
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-white text-xs sm:text-sm">
                              {plan.name}
                            </h4>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">
                            {plan.tagline}
                          </p>

                          <div className="mb-3">
                            <span className="text-xl font-black text-amber-400 font-sans">
                              R{effectivePrice}
                            </span>
                            <span className="text-[10px] text-slate-400"> / month</span>
                            {billingCycle === 'annual' && (
                              <span className="block text-[9px] text-emerald-400 font-semibold">
                                Billed annually (Save R{(plan.priceMonthlyZAR - (plan.priceAnnualMonthlyZAR || plan.priceMonthlyZAR)) * 12}/yr)
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 mb-3 text-[11px] text-slate-300">
                            <div className="flex items-center gap-1.5 font-semibold text-white">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>{plan.listingLimit === 9999 ? 'Unlimited' : plan.listingLimit} Listings Cap</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>{plan.featuredListingsLimit} Spotlight Featured</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>Direct WhatsApp Leads</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 text-[10px] text-center font-bold text-amber-400">
                          {isSelected ? '✓ Plan Selected' : 'Click to Select'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Promotional Voucher / Discount Code */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Promotional Voucher Code</span>
                    <span className="text-[10px] text-slate-400">Enter SCRAPYARD25, PROGROWTH150, or TRIAL14DAY</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE"
                    className="w-36 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {promoMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{promoMessage}</span>
                </div>
              )}
              {promoError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  {promoError}
                </div>
              )}

              {/* Submit Registration Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  By clicking Register, you activate instant scrap yard advertising on Part Source ZA with 0% sales commission.
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Register & Activate {selectedPlan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
