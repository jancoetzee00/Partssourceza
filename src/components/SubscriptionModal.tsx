import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  HelpCircle, 
  Copy,
  Sparkles,
  ArrowRight,
  Tag,
  Percent,
  Flame,
  Gift,
  AlertCircle
} from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { SellerTier, SubscriptionDiscount } from '../types';

export const SubscriptionModal: React.FC = () => {
  const { 
    isSubscriptionModalOpen, 
    setIsSubscriptionModalOpen, 
    currentSeller, 
    updateSellerSubscription,
    bankingDetails,
    subscriptionDiscounts,
    validateAndApplyPromoCode,
    showNotification
  } = useApp();

  const [selectedTier, setSelectedTier] = useState<SellerTier>(currentSeller?.subscriptionTier || 'pro');
  const [paymentStep, setPaymentStep] = useState<'select' | 'invoice'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'eft' | 'instant'>('eft');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Promo code discount state
  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<SubscriptionDiscount | null>(null);
  const [discountSavingsZAR, setDiscountSavingsZAR] = useState(0);
  const [finalDiscountedPriceZAR, setFinalDiscountedPriceZAR] = useState<number | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isSubscriptionModalOpen) return null;

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedTier) || SUBSCRIPTION_PLANS[1];

  const handleApplyPromo = (codeToApply = promoInput) => {
    setPromoError(null);
    setPromoMessage(null);
    const res = validateAndApplyPromoCode(codeToApply, selectedTier);
    if (res.valid && res.discount) {
      setAppliedDiscount(res.discount);
      setDiscountSavingsZAR(res.discountAmountZAR || 0);
      setFinalDiscountedPriceZAR(res.finalPriceZAR ?? currentPlan.priceMonthlyZAR);
      setPromoMessage(res.message || 'Promo code applied!');
      setPromoInput(res.discount.code);
      showNotification('Voucher Applied!', res.message || 'Discount applied to monthly billing.', 'success');
    } else {
      setAppliedDiscount(null);
      setDiscountSavingsZAR(0);
      setFinalDiscountedPriceZAR(null);
      setPromoError(res.message || 'Invalid promo code for this tier.');
      showNotification('Voucher Error', res.message || 'Unable to apply code.', 'warning');
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setDiscountSavingsZAR(0);
    setFinalDiscountedPriceZAR(null);
    setPromoMessage(null);
    setPromoError(null);
    setPromoInput('');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showNotification('Copied to Clipboard', `${label}: ${text}`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConfirmSubscription = () => {
    updateSellerSubscription(currentSeller.id, selectedTier);
    if (appliedDiscount) {
      showNotification(
        'Subscription Activated with Special', 
        `Plan updated with voucher ${appliedDiscount.code}. Savings: R${discountSavingsZAR}/mo.`, 
        'success'
      );
    }
    setIsSubscriptionModalOpen(false);
  };

  const activePayablePrice = finalDiscountedPriceZAR !== null ? finalDiscountedPriceZAR : currentPlan.priceMonthlyZAR;
  const paymentReference = `PS-SUB-${currentSeller.id.replace('seller-', '').toUpperCase()}`;

  // Featured checkout discounts that apply to the selected tier or all tiers
  const featuredDiscounts = subscriptionDiscounts.filter(
    d => d.isActive && d.isFeaturedOnCheckout && (d.applicableTiers.includes('all') || d.applicableTiers.includes(selectedTier))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-inner">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                Seller Monthly Subscription
              </h2>
              <p className="text-xs text-slate-400">
                Supplier: <span className="text-amber-400 font-semibold">{currentSeller?.businessName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSubscriptionModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          
          {paymentStep === 'select' ? (
            <div className="space-y-6">
              
              {/* Featured Checkout Specials Banner */}
              {featuredDiscounts.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      Available Promotional Specials for Auto Dismantlers:
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">1-Click Apply</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {featuredDiscounts.map(d => (
                      <div 
                        key={d.id}
                        className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between hover:border-amber-500/50 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-300 text-xs">{d.code}</span>
                            {d.badgeText && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950">
                                {d.badgeText}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">{d.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPromoInput(d.code);
                            handleApplyPromo(d.code);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            appliedDiscount?.code === d.code
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30'
                          }`}
                        >
                          {appliedDiscount?.code === d.code ? '✓ Applied' : 'Apply'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Select Supplier Subscription Plan & Pricing</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reach mechanics, panel beaters, and car owners searching for spares in South Africa.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  0% Sales Commission • Direct WhatsApp Leads
                </span>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {SUBSCRIPTION_PLANS.map(plan => {
                  const isSelected = selectedTier === plan.id;
                  const isCurrent = currentSeller?.subscriptionTier === plan.id;
                  
                  // If selected and discount is applied
                  const hasDiscount = isSelected && appliedDiscount;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedTier(plan.id);
                        if (appliedDiscount) {
                          // revalidate for newly selected tier
                          const res = validateAndApplyPromoCode(appliedDiscount.code, plan.id);
                          if (res.valid && res.discount) {
                            setDiscountSavingsZAR(res.discountAmountZAR || 0);
                            setFinalDiscountedPriceZAR(res.finalPriceZAR ?? plan.priceMonthlyZAR);
                          } else {
                            setAppliedDiscount(null);
                            setDiscountSavingsZAR(0);
                            setFinalDiscountedPriceZAR(null);
                            setPromoMessage(null);
                          }
                        }
                      }}
                      className={`rounded-2xl p-4 border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs sm:text-sm">{plan.name}</span>
                          {plan.popular && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                              POPULAR
                            </span>
                          )}
                          {plan.bestValue && (
                            <span className="text-[9px] bg-purple-500 text-white font-black px-1.5 py-0.2 rounded">
                              BEST VALUE
                            </span>
                          )}
                          {plan.isNew && (
                            <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                              NEW NETWORK
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-400 mb-2 line-clamp-2">
                          {plan.tagline}
                        </p>

                        <div className="mb-3">
                          {hasDiscount && finalDiscountedPriceZAR !== null ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-amber-400 font-sans">
                                  R{finalDiscountedPriceZAR}
                                </span>
                                <span className="text-xs text-slate-500 line-through font-sans">
                                  R{plan.priceMonthlyZAR}
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-bold block">
                                {appliedDiscount.badgeText || `Save R${discountSavingsZAR}/mo`}
                              </span>
                            </div>
                          ) : (
                            <div className="text-xl font-black text-amber-400 font-sans">
                              R{plan.priceMonthlyZAR}
                              <span className="text-xs text-slate-400 font-normal"> /mo</span>
                            </div>
                          )}
                        </div>

                        <ul className="space-y-1.5 text-slate-300">
                          {plan.features.slice(0, 4).map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span className="text-[10px] leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Click to Pick'}
                        </span>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Input Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    Have a Special Promo / Discount Code?
                  </label>
                  {appliedDiscount && (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Remove Code
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. SCRAPYARD25, PROMO25)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>Apply Code</span>
                  </button>
                </div>

                {promoMessage && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{promoMessage}</span>
                  </div>
                )}

                {promoError && (
                  <div className="text-[11px] text-red-400 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{promoError}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStep('invoice')}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <span>Proceed to Payment (R{activePayablePrice}/mo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Payment & Official Banking Details View */
            <div className="space-y-6">
              
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Selected Plan:</span>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {currentPlan.name}
                    {appliedDiscount && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950">
                        {appliedDiscount.code} ({appliedDiscount.badgeText})
                      </span>
                    )}
                  </h4>
                  {appliedDiscount && (
                    <span className="text-[11px] text-emerald-400 block mt-0.5">
                      Promotional discount applied (-R{discountSavingsZAR}/mo)
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {appliedDiscount && (
                      <span className="text-sm text-slate-500 line-through font-sans">
                        R{currentPlan.priceMonthlyZAR}
                      </span>
                    )}
                    <span className="text-2xl font-black text-amber-400 font-sans">
                      R{activePayablePrice}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Monthly Billing (excl. cancellation penalty)</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  Payment Channel
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('eft')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'eft'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-xs">🏦 Direct Bank EFT / Wire</span>
                    <span className="text-[11px] text-slate-400">Transfer directly to official Part Source ZA bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('instant')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'instant'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-xs">⚡ Instant Card / Ozow</span>
                    <span className="text-[11px] text-slate-400">Instant monthly subscription clearance</span>
                  </button>
                </div>
              </div>

              {/* Official Banking Details Section (Linked to owner state) */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    Part Source ZA Official Receiving Bank Details
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">VERIFIED OFFICIAL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Bank Name</span>
                      <span className="font-bold text-white text-xs">{bankingDetails.bankName}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankingDetails.bankName, 'Bank')}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Account Holder</span>
                      <span className="font-bold text-white text-xs">{bankingDetails.accountHolder}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankingDetails.accountHolder, 'Account Holder')}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Account Number</span>
                      <span className="font-mono font-black text-amber-400 text-sm">{bankingDetails.accountNumber}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankingDetails.accountNumber, 'Account Number')}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Branch Code / Universal</span>
                      <span className="font-mono font-bold text-white text-xs">{bankingDetails.branchCode}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankingDetails.branchCode, 'Branch Code')}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="sm:col-span-2 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 block font-bold uppercase">Required Payment Reference</span>
                      <span className="font-mono font-black text-amber-300 text-sm">{paymentReference}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(paymentReference, 'Reference')}
                      className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Reference</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic pt-1">
                  {bankingDetails.sellerFeeNotice}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentStep('select')}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  ← Back to Plans & Vouchers
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSubscription}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Activate / Renew Monthly (R{activePayablePrice})</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
