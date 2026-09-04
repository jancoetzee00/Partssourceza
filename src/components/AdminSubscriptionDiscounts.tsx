import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Tag, 
  Percent, 
  Sparkles, 
  Plus, 
  Search, 
  Check, 
  Copy, 
  Trash2, 
  Edit3, 
  Calendar, 
  Gift, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  ArrowRight,
  Filter,
  Eye,
  Sliders,
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';
import { SubscriptionDiscount, SellerTier } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/mockData';

export const AdminSubscriptionDiscounts: React.FC = () => {
  const { 
    subscriptionDiscounts, 
    addSubscriptionDiscount, 
    updateSubscriptionDiscount, 
    deleteSubscriptionDiscount, 
    toggleDiscountActive, 
    toggleDiscountFeatured, 
    validateAndApplyPromoCode,
    sellers,
    isDevApp,
    showNotification
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [discountToDelete, setDiscountToDelete] = useState<SubscriptionDiscount | null>(null);
  const [isDeletingDiscount, setIsDeletingDiscount] = useState(false);

  const initialFormState: Omit<SubscriptionDiscount, 'id' | 'createdAt' | 'usageCount'> = {
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    applicableTiers: ['all'],
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    isActive: true,
    isFeaturedOnCheckout: true,
    badgeText: '🔥 20% OFF',
    bannerMessage: 'Limited time discount for registered auto dismantlers & suppliers.'
  };

  const [form, setForm] = useState<Omit<SubscriptionDiscount, 'id' | 'createdAt' | 'usageCount'>>(initialFormState);

  // Interactive Live Pricing Simulator State
  const [simulatedTier, setSimulatedTier] = useState<SellerTier>('pro');
  const [simulatedCode, setSimulatedCode] = useState<string>('SCRAPYARD25');
  const [simulationResult, setSimulationResult] = useState<ReturnType<typeof validateAndApplyPromoCode> | null>(null);

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generateRandomCode = () => {
    const prefixes = ['SCRAP', 'MOBI', 'SPRING', 'TURBO', 'FLEET', 'PARTS', 'BOOST', 'DISMANTLE'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 89);
    const generated = `${randomPrefix}${randomNum}`;
    setForm(prev => ({
      ...prev,
      code: generated,
      badgeText: prev.discountType === 'percentage' ? `🔥 ${prev.discountValue}% OFF` : `⚡ R${prev.discountValue} OFF`
    }));
    showNotification('Code Generated', `Generated new promotional code: ${generated}`, 'info');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    showNotification('Copied to Clipboard', `Promo code "${code}" copied.`, 'success');
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (discount: SubscriptionDiscount) => {
    setEditingId(discount.id);
    setForm({
      code: discount.code,
      title: discount.title,
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      applicableTiers: discount.applicableTiers,
      validUntil: discount.validUntil,
      usageLimit: discount.usageLimit,
      isActive: discount.isActive,
      isFeaturedOnCheckout: discount.isFeaturedOnCheckout,
      badgeText: discount.badgeText,
      bannerMessage: discount.bannerMessage
    });
    setIsModalOpen(true);
  };

  const handleSaveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      showNotification('Validation Error', 'Please enter a coupon code name.', 'warning');
      return;
    }

    if (editingId) {
      updateSubscriptionDiscount(editingId, form);
    } else {
      addSubscriptionDiscount(form);
    }
    setIsModalOpen(false);
  };

  const handleSimulate = (tier = simulatedTier, code = simulatedCode) => {
    const result = validateAndApplyPromoCode(code, tier);
    setSimulationResult(result);
  };

  // Preset Template Quick Fill
  const applyTemplate = (type: 'percentage_25' | 'fixed_150' | 'trial_14' | 'half_price') => {
    if (type === 'percentage_25') {
      setForm({
        ...form,
        code: 'PROMO25',
        title: '25% Scrap Yard Launch Special',
        description: 'Enjoy 25% recurring or first-month subscription discount on all supplier plans.',
        discountType: 'percentage',
        discountValue: 25,
        applicableTiers: ['all'],
        badgeText: '🔥 25% OFF',
        bannerMessage: 'Exclusive 25% OFF launch voucher for registered South African auto scrap yards.'
      });
    } else if (type === 'fixed_150') {
      setForm({
        ...form,
        code: 'DISMANTLER150',
        title: 'R150 Pro Dismantler Credit',
        description: 'Instant R150 rebate on Pro Auto Dismantler tier subscriptions.',
        discountType: 'fixed_amount',
        discountValue: 150,
        applicableTiers: ['pro'],
        badgeText: '⚡ R150 OFF',
        bannerMessage: 'Save R150 monthly on the Pro Auto Dismantler subscription plan.'
      });
    } else if (type === 'trial_14') {
      setForm({
        ...form,
        code: 'BONUSTRIAL14',
        title: '14-Day Risk-Free Trial Extension',
        description: 'Double the free trial period to 28 days for new scrap yards joining Part Source ZA.',
        discountType: 'trial_days',
        discountValue: 14,
        applicableTiers: ['starter', 'pro'],
        badgeText: '🎁 +14 DAYS TRIAL',
        bannerMessage: 'Unlock 14 additional risk-free trial days before your first billing cycle.'
      });
    } else if (type === 'half_price') {
      setForm({
        ...form,
        code: 'HALFOFF50',
        title: '50% First Month Flash Sale',
        description: 'Half-price onboarding special for high-volume commercial fleet suppliers.',
        discountType: 'percentage',
        discountValue: 50,
        applicableTiers: ['enterprise'],
        badgeText: '💎 50% VIP OFF',
        bannerMessage: 'Massive 50% discount for enterprise commercial yards and salvage fleets.'
      });
    }
    showNotification('Template Loaded', 'Applied promotion preset values into form.', 'info');
  };

  // Filtered list
  const filteredDiscounts = subscriptionDiscounts.filter(d => {
    const matchesSearch = 
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = 
      tierFilter === 'all' || 
      d.applicableTiers.includes('all') || 
      d.applicableTiers.includes(tierFilter as SellerTier);
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && d.isActive) || 
      (statusFilter === 'inactive' && !d.isActive);
    return matchesSearch && matchesTier && matchesStatus;
  });

  // KPI Calculations
  const activeCount = subscriptionDiscounts.filter(d => d.isActive).length;
  const featuredCount = subscriptionDiscounts.filter(d => d.isActive && d.isFeaturedOnCheckout).length;
  const totalRedemptions = subscriptionDiscounts.reduce((sum, d) => sum + (d.usageCount || 0), 0);
  const estimatedSavingsZAR = subscriptionDiscounts.reduce((sum, d) => {
    if (d.discountType === 'fixed_amount') {
      return sum + (d.discountValue * (d.usageCount || 0));
    }
    if (d.discountType === 'percentage') {
      // Estimate against Pro plan (R699)
      return sum + Math.round((699 * d.discountValue / 100) * (d.usageCount || 0));
    }
    return sum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 pb-12">
      
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Tag className="w-48 h-48 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Subscription Specials & Voucher Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Firestore Synced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Subscription Discounts & Special Promotions
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Create and manage promotional discount codes, percentage vouchers, bonus trial extensions, 
              and featured onboarding specials for South African auto dismantlers and scrap yards.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => handleSimulate()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs transition-all border border-amber-500/30 flex items-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>Test Voucher Simulator</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Special</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Active Specials</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white font-mono">{activeCount}</span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              of {subscriptionDiscounts.length} total campaigns
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Checkout Featured</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400 font-mono">{featuredCount}</span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              Shown to sellers during sign-up
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Supplier Redemptions</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-400 font-mono">{totalRedemptions}</span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              Total promo code claims
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold">Total Discount Value</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-300 font-sans">{formatZAR(estimatedSavingsZAR)}</span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              Supplier onboarding savings
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Plans Pricing Grid with Discount Impact */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Standard Subscription Tiers & Live Discount Eligibility
            </h3>
            <p className="text-[11px] text-slate-400">
              Base South African monthly subscription rates for scrap yards before promotional discounts are applied.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {sellers.length} active registered supplier accounts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const applicableSpecials = subscriptionDiscounts.filter(
              d => d.isActive && (d.applicableTiers.includes('all') || d.applicableTiers.includes(plan.id as SellerTier))
            );

            return (
              <div 
                key={plan.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-amber-400 font-mono tracking-wider">
                      {plan.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {plan.listingLimit} Parts Max
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-2xl font-black text-white font-sans">
                      R{plan.priceMonthlyZAR}
                    </span>
                    <span className="text-xs text-slate-400">/month</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {plan.badgeName} • {plan.features[0]}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1.5">
                    Active Applicable Specials ({applicableSpecials.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {applicableSpecials.length > 0 ? (
                      applicableSpecials.slice(0, 3).map(sp => (
                        <span 
                          key={sp.id}
                          className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-mono font-bold"
                          title={sp.title}
                        >
                          {sp.code} ({sp.discountType === 'percentage' ? `${sp.discountValue}%` : sp.discountType === 'fixed_amount' ? `R${sp.discountValue}` : `+${sp.discountValue}d`})
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No specials active for this tier</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coupon code or campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Subscription Plans</option>
            <option value="starter">Starter (R299/mo)</option>
            <option value="pro">Pro (R699/mo)</option>
            <option value="enterprise">Enterprise (R1,499/mo)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Campaign Statuses</option>
            <option value="active">Active Campaigns Only</option>
            <option value="inactive">Paused / Inactive Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{filteredDiscounts.length}</span> of {subscriptionDiscounts.length} specials
        </div>
      </div>

      {/* Specials & Discounts Master Grid / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              Active & Configured Subscription Promotion Vouchers
            </h3>
            <p className="text-[11px] text-slate-400">
              Live discount rules applied automatically when suppliers enter promo codes during checkout.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Dev Admin Superpowers: <span className="text-emerald-400 font-bold">Enabled</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Promo Code</th>
                <th className="py-3.5 px-4">Campaign Title & Benefit</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Applicable Tiers</th>
                <th className="py-3.5 px-4">Redemptions</th>
                <th className="py-3.5 px-4">Validity</th>
                <th className="py-3.5 px-4 text-center">Featured on Checkout</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {filteredDiscounts.map((discount) => {
                const isExpired = discount.validUntil && new Date(discount.validUntil).getTime() < new Date().setHours(0,0,0,0);
                const isLimitReached = discount.usageLimit > 0 && discount.usageCount >= discount.usageLimit;

                return (
                  <tr 
                    key={discount.id} 
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Promo Code with Copy Button */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-400 text-xs px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          {discount.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(discount.code, discount.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Copy Promo Code"
                        >
                          {copiedCodeId === discount.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Campaign Title & Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{discount.title}</span>
                        {discount.badgeText && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-800 text-amber-300 border border-slate-700">
                            {discount.badgeText}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {discount.description}
                      </p>
                    </td>

                    {/* Discount Value */}
                    <td className="py-3 px-4">
                      <div className="font-black text-emerald-400 text-sm">
                        {discount.discountType === 'percentage' && `${discount.discountValue}% OFF`}
                        {discount.discountType === 'fixed_amount' && `R${discount.discountValue} OFF`}
                        {discount.discountType === 'trial_days' && `+${discount.discountValue} Days Trial`}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">
                        {discount.discountType.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Applicable Tiers */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {discount.applicableTiers.map((t, idx) => (
                          <span 
                            key={idx}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t === 'all' 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Usage Count & Limit Progress */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-white font-bold">{discount.usageCount || 0}</span>
                          <span className="text-slate-500">
                            {discount.usageLimit > 0 ? `/ ${discount.usageLimit}` : '(Unlimited)'}
                          </span>
                        </div>
                        {discount.usageLimit > 0 && (
                          <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                isLimitReached ? 'bg-red-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, ((discount.usageCount || 0) / discount.usageLimit) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Validity / Expiry Date */}
                    <td className="py-3 px-4">
                      {discount.validUntil ? (
                        <div>
                          <span className={`text-[11px] font-mono font-bold block ${
                            isExpired ? 'text-red-400 line-through' : 'text-slate-200'
                          }`}>
                            {discount.validUntil}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {isExpired ? 'Expired' : 'Valid Until'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Never expires</span>
                      )}
                    </td>

                    {/* Featured on Checkout Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleDiscountFeatured(discount.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1.5 ${
                          discount.isFeaturedOnCheckout
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Toggle visibility in seller checkout modal"
                      >
                        <Flame className="w-3 h-3" />
                        <span>{discount.isFeaturedOnCheckout ? 'Featured' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Status Active/Paused */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleDiscountActive(discount.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 ${
                          discount.isActive && !isExpired && !isLimitReached
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          discount.isActive && !isExpired && !isLimitReached ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`} />
                        <span>
                          {isExpired ? 'Expired' : isLimitReached ? 'Maxed' : discount.isActive ? 'Active' : 'Paused'}
                        </span>
                      </button>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSimulatedCode(discount.code);
                            setSimulatedTier(discount.applicableTiers[0] === 'all' ? 'pro' : (discount.applicableTiers[0] as SellerTier));
                            handleSimulate(discount.applicableTiers[0] === 'all' ? 'pro' : (discount.applicableTiers[0] as SellerTier), discount.code);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                          title="Simulate in Live Calculator"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(discount)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                          title="Edit Discount"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                        <button
                          onClick={() => setDiscountToDelete(discount)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete Discount"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Voucher Simulator & Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Live Subscription Discount & Pricing Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify how discount vouchers compute against actual South African monthly subscription fees before publishing.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-mono font-bold">
            Real-Time Engine
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Select Target Subscription Tier:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SUBSCRIPTION_PLANS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSimulatedTier(p.id as SellerTier);
                      handleSimulate(p.id as SellerTier, simulatedCode);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      simulatedTier === p.id 
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block text-xs text-white">{p.name}</span>
                    <span className="text-amber-400 font-sans font-black text-sm">R{p.priceMonthlyZAR}</span>
                    <span className="text-[10px] text-slate-500 block">{p.listingLimit} parts</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Enter Promo Code to Test:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SCRAPYARD25"
                  value={simulatedCode}
                  onChange={(e) => setSimulatedCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleSimulate(simulatedTier, simulatedCode)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Run Validation</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                Quick Test Active Specials:
              </span>
              <div className="flex flex-wrap gap-2">
                {subscriptionDiscounts.filter(d => d.isActive).map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSimulatedCode(d.code);
                      handleSimulate(simulatedTier, d.code);
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-amber-400 transition-colors"
                  >
                    {d.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            {simulationResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {simulationResult.valid ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-slate-950 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Valid Voucher
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500 text-white flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Invalid / Inapplicable
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-300">{simulatedCode}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Tier: {simulatedTier.toUpperCase()}
                  </span>
                </div>

                {simulationResult.valid ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{simulationResult.message}</span>
                    </div>

                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Original Monthly Price:</span>
                        <span className="font-mono text-slate-200">
                          R{SUBSCRIPTION_PLANS.find(p => p.id === simulatedTier)?.priceMonthlyZAR}
                        </span>
                      </div>

                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Discount Deduction:</span>
                        <span className="font-mono">
                          -R{simulationResult.discountAmountZAR} ({simulationResult.discount?.badgeText})
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Estimated 15% VAT Portion:</span>
                        <span className="font-mono">
                          R{Math.round(((simulationResult.finalPriceZAR || 0) * 15) / 115)}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-white">Final Monthly Payable:</span>
                        <span className="text-2xl font-black text-amber-400 font-sans">
                          R{simulationResult.finalPriceZAR}
                          <span className="text-xs text-slate-400 font-normal"> /mo</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 text-xs text-red-300">
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Discount Evaluation Failed
                    </div>
                    <p>{simulationResult.message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Sliders className="w-8 h-8 opacity-40 text-amber-400" />
                <span className="text-xs font-semibold text-slate-400">Run the voucher simulator</span>
                <p className="text-[11px] max-w-xs text-slate-500">
                  Select a subscription tier and click "Run Validation" to review exact discounted monthly bills and savings.
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Note: Discount calculations apply to monthly subscription EFT invoices and online payments.
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT DISCOUNT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingId ? 'Edit Subscription Special' : 'Create New Subscription Discount'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define discount amounts, target supplier tiers, validity, and checkout messaging.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            {!editingId && (
              <div className="p-5 pb-0">
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block mb-2">
                  Quick Load Preset Campaigns:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate('percentage_25')}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all"
                  >
                    <span className="text-amber-400 font-bold block text-xs">🔥 25% Off All</span>
                    <span className="text-[10px] text-slate-500">Launch Promo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('fixed_150')}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all"
                  >
                    <span className="text-emerald-400 font-bold block text-xs">⚡ R150 Credit</span>
                    <span className="text-[10px] text-slate-500">Pro Dismantlers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('trial_14')}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all"
                  >
                    <span className="text-blue-400 font-bold block text-xs">🎁 +14 Days</span>
                    <span className="text-[10px] text-slate-500">Extended Trial</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('half_price')}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all"
                  >
                    <span className="text-purple-400 font-bold block text-xs">💎 50% Off VIP</span>
                    <span className="text-[10px] text-slate-500">Commercial Fleet</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveDiscount} className="p-5 space-y-4">
              
              {/* Row 1: Code & Generate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      Promo / Coupon Code *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="text-[10px] text-amber-400 hover:underline font-semibold"
                    >
                      🎲 Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCRAPYARD25"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25% Scrap Yard Launch Special"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 2: Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Discount Benefit Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => {
                      const type = e.target.value as SubscriptionDiscount['discountType'];
                      setForm({
                        ...form,
                        discountType: type,
                        discountValue: type === 'percentage' ? 20 : type === 'fixed_amount' ? 150 : 14,
                        badgeText: type === 'percentage' ? '🔥 20% OFF' : type === 'fixed_amount' ? '⚡ R150 OFF' : '🎁 +14 DAYS TRIAL'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="percentage">Percentage Discount (% OFF Monthly Fee)</option>
                    <option value="fixed_amount">Fixed Amount Discount (R ZAR OFF)</option>
                    <option value="trial_days">Bonus Free Trial Extension (Extra Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Discount Value ({form.discountType === 'percentage' ? '% percentage' : form.discountType === 'fixed_amount' ? 'R ZAR' : 'days'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={form.discountType === 'percentage' ? 100 : 5000}
                    required
                    value={form.discountValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setForm({ 
                        ...form, 
                        discountValue: val,
                        badgeText: form.discountType === 'percentage' ? `🔥 ${val}% OFF` : form.discountType === 'fixed_amount' ? `⚡ R${val} OFF` : `🎁 +${val} DAYS`
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                  Description & Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the terms, target audience, or reason for this special..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Row 4: Applicable Tiers */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                  Target Applicable Subscription Tiers *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All Tiers (Universal)' },
                    { id: 'starter', label: 'Starter (R299)' },
                    { id: 'pro', label: 'Pro (R699)' },
                    { id: 'enterprise', label: 'Enterprise (R1499)' },
                  ].map(t => {
                    const isChecked = form.applicableTiers.includes(t.id as any);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          if (t.id === 'all') {
                            setForm({ ...form, applicableTiers: ['all'] });
                          } else {
                            let updated = form.applicableTiers.filter(x => x !== 'all');
                            if (updated.includes(t.id as SellerTier)) {
                              updated = updated.filter(x => x !== t.id);
                            } else {
                              updated.push(t.id as SellerTier);
                            }
                            if (updated.length === 0) updated = ['all'];
                            setForm({ ...form, applicableTiers: updated });
                          }
                        }}
                        className={`p-2 rounded-xl border text-xs font-bold text-left transition-all ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{t.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Validity Date & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Valid Until (Expiry Date)
                  </label>
                  <input
                    type="date"
                    value={form.validUntil || ''}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Max Redemptions / Usage Limit (0 = Unlimited)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 6: Badge & Banner Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Highlight Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 🔥 25% OFF"
                    value={form.badgeText || ''}
                    onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                    Checkout Banner Message
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Limited time discount for auto dismantlers."
                    value={form.bannerMessage || ''}
                    onChange={(e) => setForm({ ...form, bannerMessage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row 7: Toggles */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block">Active Campaign Status</span>
                    <span className="text-[11px] text-slate-400">Allow sellers to redeem this promo code immediately</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="font-bold text-white text-xs block">Feature Prominently on Seller Checkout</span>
                    <span className="text-[11px] text-slate-400">Show as 1-click selectable voucher when suppliers view plan upgrades</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isFeaturedOnCheckout}
                    onChange={(e) => setForm({ ...form, isFeaturedOnCheckout: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Save Discount Changes' : 'Publish Special Voucher'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL: Delete Discount */}
      {discountToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl shadow-black/90 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  Discount Management
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Permanently Delete Discount?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Permanently remove promo voucher <strong className="text-amber-400 font-mono">{discountToDelete.code}</strong> ({discountToDelete.title})?
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingDiscount}
                onClick={() => setDiscountToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingDiscount}
                onClick={() => {
                  if (!discountToDelete) return;
                  setIsDeletingDiscount(true);
                  try {
                    deleteSubscriptionDiscount(discountToDelete.id);
                  } finally {
                    setIsDeletingDiscount(false);
                    setDiscountToDelete(null);
                  }
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingDiscount ? 'Deleting...' : 'Delete Coupon'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
