import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  Car, 
  Truck, 
  MapPin, 
  Radio, 
  ShieldCheck 
} from 'lucide-react';
import { SA_PROVINCES, POPULAR_MAKES, CATEGORIES } from '../data/mockData';
import { SouthAfricanProvince, VehicleType } from '../types';

export const PartRequestModal: React.FC = () => {
  const { isRequestPartOpen, setIsRequestPartOpen, showNotification } = useApp();

  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2018');
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [province, setProvince] = useState<SouthAfricanProvince>('Gauteng');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isRequestPartOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !model || !buyerName || !buyerPhone) {
      showNotification('Incomplete Request', 'Please fill in the part name, vehicle model, and contact details.', 'warning');
      return;
    }
    setSubmitted(true);
    showNotification('Broadcast Transmitted', 'Your spares request has been broadcasted to registered scrapyards & dealers in South Africa.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Broadcast Rare Auto / Truck Part Request
              </h2>
              <p className="text-xs text-slate-400">
                Direct scrap yard syndication across all 9 South African provinces
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsRequestPartOpen(false);
              setSubmitted(false);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="h-14 w-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Request Broadcasted to SA Suppliers</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your request for <strong>{make} {model} - {partName}</strong> has been transmitted to certified auto dismantlers in {province} and nationwide. Suppliers with matching spares will WhatsApp or call your number.
              </p>
              <button
                onClick={() => {
                  setIsRequestPartOpen(false);
                  setSubmitted(false);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 text-slate-200">
                <span className="font-bold text-amber-400 block mb-0.5">Looking for a hard-to-find car or truck part?</span>
                Submit your vehicle specs below. Our network of over 120+ verified scrapyards and parts suppliers will check their stripping stock and contact you directly.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e: any) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="car">Car / Sedan</option>
                    <option value="bakkie">Bakkie / SUV</option>
                    <option value="truck">Heavy Truck</option>
                    <option value="commercial">Commercial / Taxi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">Make *</label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {POPULAR_MAKES.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">Model & Year *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Polo Vivo 1.4 (2018)"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">Component Needed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cylinder Head / Rear Axle / Steering Rack"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">Part Number / OEM (if known)</label>
                  <input
                    type="text"
                    placeholder="e.g. 02T-300-058"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Andile Dlamini"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+27 83 000 0000"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[11px]">Your Province *</label>
                  <select
                    value={province}
                    onChange={(e: any) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {SA_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestPartOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Request</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
