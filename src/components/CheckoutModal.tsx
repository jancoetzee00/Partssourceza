import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CreditCard, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Copy, 
  Check,
  AlertCircle
} from 'lucide-react';
import { SA_PROVINCES } from '../data/mockData';
import { SouthAfricanProvince } from '../types';

export const CheckoutModal: React.FC = () => {
  const { 
    selectedListing, 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    createOrder, 
    bankingDetails,
    showNotification
  } = useApp();

  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [province, setProvince] = useState<SouthAfricanProvince>('Gauteng');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'EFT / Bank Transfer' | 'PayFast / Card' | 'Cash on Collection'>('EFT / Bank Transfer');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  if (!isCheckoutOpen || !selectedListing) return null;

  const deliveryFee = selectedListing.deliveryCostZAR || 350;
  const totalAmount = selectedListing.priceZAR + deliveryFee;

  const formatZAR = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !deliveryAddress) {
      showNotification('Missing Information', 'Please provide your full name, phone number, and physical delivery address.', 'warning');
      return;
    }

    setIsProcessing(true);
    const order = createOrder({
      listingId: selectedListing.id,
      partTitle: selectedListing.title,
      partNumber: selectedListing.partNumber,
      buyerName,
      buyerPhone,
      buyerEmail: buyerEmail || 'Not specified',
      sellerId: selectedListing.sellerId,
      sellerName: selectedListing.sellerName,
      amountZAR: selectedListing.priceZAR,
      deliveryFeeZAR: deliveryFee,
      totalAmountZAR: totalAmount,
      status: 'confirmed',
      paymentMethod,
      paymentStatus: paymentMethod === 'PayFast / Card' ? 'paid' : 'pending_verification',
      deliveryAddress,
      province,
      notes
    });

    setIsProcessing(false);
    setOrderComplete(order);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Purchase Auto / Truck Component
              </h2>
              <p className="text-xs text-slate-400">
                Supplier: <span className="text-slate-200 font-semibold">{selectedListing.sellerName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setOrderComplete(null);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          
          {orderComplete ? (
            <div className="text-center py-8 space-y-4">
              <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Order Successfully Placed!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your order reference is <span className="font-mono font-bold text-amber-400">{orderComplete.id}</span>. {selectedListing.sellerName} has been notified to inspect and crate your spares component.
              </p>

              {paymentMethod === 'EFT / Bank Transfer' && (
                <div className="max-w-md mx-auto p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                  <span className="font-bold text-amber-400 block text-[11px] uppercase">
                    EFT Payment Details (Deposit to Part Source ZA Escrow)
                  </span>
                  <p className="text-slate-300">Bank: <strong className="text-white">{bankingDetails.bankName}</strong></p>
                  <p className="text-slate-300">Account: <strong className="text-amber-400 font-mono">{bankingDetails.accountNumber}</strong></p>
                  <p className="text-slate-300">Branch: <strong className="text-white font-mono">{bankingDetails.branchCode}</strong></p>
                  <p className="text-slate-300">Reference: <strong className="text-amber-300 font-mono">PS-{orderComplete.id}</strong></p>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setOrderComplete(null);
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Return to Marketplace
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              
              {/* Order Summary Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedListing.images[0]}
                    alt={selectedListing.title}
                    referrerPolicy="no-referrer"
                    className="h-12 w-14 rounded-lg object-cover bg-slate-900 border border-slate-800"
                  />
                  <div>
                    <h4 className="font-bold text-white line-clamp-1">{selectedListing.title}</h4>
                    <span className="text-[11px] font-mono text-amber-400">{selectedListing.partNumber}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white font-sans">{formatZAR(totalAmount)}</span>
                  <span className="text-[10px] text-slate-400 block">(incl. R{deliveryFee} courier)</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Buyer & Delivery Destination (South Africa)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Johan van Zyl / Sipho Ndlovu"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Contact Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+27 82 123 4567"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Province *</label>
                    <select
                      value={province}
                      onChange={(e: any) => setProvince(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {SA_PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Email Address (optional)</label>
                    <input
                      type="email"
                      placeholder="johan@autocare.co.za"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Physical Street Address / Workshop Destination *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 45 Commercial Rd, Industrial Area, Bloemfontein"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2 text-[11px]">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('EFT / Bank Transfer')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'EFT / Bank Transfer'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-xs">🏦 Direct EFT</span>
                    <span className="text-[10px] text-slate-400">Official Part Source ZA bank details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PayFast / Card')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'PayFast / Card'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-xs">💳 PayFast / Ozow</span>
                    <span className="text-[10px] text-slate-400">Instant credit/debit card clearance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash on Collection')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === 'Cash on Collection'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-xs">🤝 Counter Collection</span>
                    <span className="text-[10px] text-slate-400">Collect & pay at {selectedListing.locationCity}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
                >
                  {isProcessing ? 'Processing Order...' : `Confirm & Place Order (${formatZAR(totalAmount)})`}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
