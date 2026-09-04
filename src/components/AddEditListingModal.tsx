import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Plus, 
  Upload, 
  Check, 
  Car, 
  Truck, 
  ShieldCheck, 
  DollarSign, 
  MapPin, 
  Layers,
  Image as ImageIcon,
  Sparkles,
  Info,
  Trash2
} from 'lucide-react';
import { Listing, VehicleType, PartCategory, PartCondition, SouthAfricanProvince } from '../types';
import { SA_PROVINCES, POPULAR_MAKES, CATEGORIES } from '../data/mockData';

const SAMPLE_PART_IMAGES = [
  { label: 'Turbo Engine', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Brake Disc & Caliper', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Gearbox / Transmission', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80' },
  { label: 'Headlight & Front End', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },
  { label: 'Truck Driveline / Axle', url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Engine Bay / Alternator', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80' },
  { label: 'Tires & Alloy Wheels', url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Hydraulic Ram & Pumps', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' }
];

export const AddEditListingModal: React.FC = () => {
  const { 
    isAddEditModalOpen, 
    setIsAddEditModalOpen, 
    editingListing, 
    setEditingListing, 
    currentSeller, 
    addListing, 
    updateListing,
    deleteListing,
    role,
    showNotification
  } = useApp();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    partNumber: '',
    oemNumber: '',
    make: 'Toyota',
    model: '',
    yearStart: 2018,
    yearEnd: 2024,
    engineSpec: '',
    vehicleType: 'bakkie' as VehicleType,
    category: 'Engine & Mechanical' as PartCategory,
    condition: 'Reconditioned / Tested' as PartCondition,
    priceZAR: 4500,
    originalPriceZAR: 0,
    warrantyMonths: 6,
    stockCount: 1,
    locationCity: currentSeller?.city || 'Johannesburg',
    locationProvince: currentSeller?.province || 'Gauteng',
    images: [SAMPLE_PART_IMAGES[0].url],
    description: '',
    isFeatured: false,
    isNationwideDelivery: true,
    deliveryDaysEstimate: '2-3 Business Days',
    deliveryCostZAR: 250
  });

  useEffect(() => {
    if (editingListing) {
      setFormData({
        title: editingListing.title,
        partNumber: editingListing.partNumber,
        oemNumber: editingListing.oemNumber || '',
        make: editingListing.make,
        model: editingListing.model,
        yearStart: editingListing.yearStart,
        yearEnd: editingListing.yearEnd,
        engineSpec: editingListing.engineSpec || '',
        vehicleType: editingListing.vehicleType,
        category: editingListing.category,
        condition: editingListing.condition,
        priceZAR: editingListing.priceZAR,
        originalPriceZAR: editingListing.originalPriceZAR || 0,
        warrantyMonths: editingListing.warrantyMonths,
        stockCount: editingListing.stockCount,
        locationCity: editingListing.locationCity,
        locationProvince: editingListing.locationProvince,
        images: editingListing.images.length > 0 ? editingListing.images : [SAMPLE_PART_IMAGES[0].url],
        description: editingListing.description,
        isFeatured: editingListing.isFeatured,
        isNationwideDelivery: editingListing.isNationwideDelivery,
        deliveryDaysEstimate: editingListing.deliveryDaysEstimate,
        deliveryCostZAR: editingListing.deliveryCostZAR
      });
    } else {
      setFormData({
        title: '',
        partNumber: '',
        oemNumber: '',
        make: 'Toyota',
        model: 'Hilux 2.8 GD-6',
        yearStart: 2016,
        yearEnd: 2024,
        engineSpec: '2.8L GD-6 D-4D',
        vehicleType: 'bakkie',
        category: 'Engine & Mechanical',
        condition: 'Reconditioned / Tested',
        priceZAR: 12500,
        originalPriceZAR: 14000,
        warrantyMonths: 6,
        stockCount: 2,
        locationCity: currentSeller?.city || 'Johannesburg (Boksburg)',
        locationProvince: currentSeller?.province || 'Gauteng',
        images: [SAMPLE_PART_IMAGES[0].url],
        description: 'Genuine guaranteed original auto component. Tested and clean with full supplier warranty. Nationwide courier or walk-in counter collection.',
        isFeatured: false,
        isNationwideDelivery: true,
        deliveryDaysEstimate: '2-3 Business Days',
        deliveryCostZAR: 350
      });
    }
  }, [editingListing, currentSeller]);

  if (!isAddEditModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.partNumber || !formData.make || !formData.model || !formData.priceZAR) {
      showNotification('Required Fields', 'Please fill in Title, Part Number, Make, Model, and Price.', 'warning');
      return;
    }

    if (editingListing) {
      updateListing(editingListing.id, {
        ...formData,
        originalPriceZAR: formData.originalPriceZAR > 0 ? formData.originalPriceZAR : undefined
      });
    } else {
      addListing({
        ...formData,
        originalPriceZAR: formData.originalPriceZAR > 0 ? formData.originalPriceZAR : undefined,
        sellerId: currentSeller.id,
        sellerName: currentSeller.businessName,
        sellerPhone: currentSeller.phone,
        sellerWhatsApp: currentSeller.whatsapp,
        sellerEmail: currentSeller.email,
        sellerRating: currentSeller.rating,
        sellerVerified: currentSeller.verified
      });
    }

    setIsAddEditModalOpen(false);
    setEditingListing(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {editingListing ? 'Edit Auto / Truck Part Listing' : 'Publish New Auto / Truck Part'}
              </h2>
              <p className="text-xs text-slate-400">
                Supplier: <span className="text-slate-200 font-semibold">{currentSeller?.businessName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAddEditModalOpen(false);
              setEditingListing(null);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          
          {/* Part Title */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px]">
              Listing Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Complete 1GD-FTV 2.8L Turbo Diesel Engine with Injectors"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Vehicle Compatibility Specs */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-4">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              Vehicle Compatibility & Type
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vehicle Type */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e: any) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="car">Car / Hatchback / Sedan</option>
                  <option value="bakkie">Bakkie / 4x4 / SUV</option>
                  <option value="truck">Heavy Duty Truck</option>
                  <option value="commercial">Commercial / Minibus Taxi</option>
                </select>
              </div>

              {/* Make */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Manufacturer / Make *</label>
                <select
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {POPULAR_MAKES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Model Application *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hilux / Fortuner 2.8 GD-6"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Year start */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">From Year</label>
                <input
                  type="number"
                  min={1980}
                  max={2026}
                  value={formData.yearStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearStart: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Year end */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">To Year</label>
                <input
                  type="number"
                  min={1980}
                  max={2026}
                  value={formData.yearEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearEnd: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Engine Spec */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Engine / Transmission Spec</label>
                <input
                  type="text"
                  placeholder="e.g. 2.8L 1GD / 6-Speed Auto"
                  value={formData.engineSpec}
                  onChange={(e) => setFormData(prev => ({ ...prev, engineSpec: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

          </div>

          {/* Part Classification & Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Part Category *
              </label>
              <select
                value={formData.category}
                onChange={(e: any) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e: any) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Brand New OEM">Brand New OEM</option>
                <option value="Brand New Aftermarket">Brand New Aftermarket</option>
                <option value="Reconditioned / Tested">Reconditioned / Tested</option>
                <option value="Used Original (Clean)">Used Original (Clean)</option>
                <option value="Scrap Stripping (Used)">Scrap Stripping (Used)</option>
              </select>
            </div>

            {/* Part Number */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px]">
                Part Number / SKU *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1GD-FTV-2.8D-OEM"
                value={formData.partNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            {/* OEM Number */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px]">
                OEM Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 19000-0E080"
                value={formData.oemNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, oemNumber: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

          </div>

          {/* Pricing, Warranty & Stock */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">Price (ZAR Rands) *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.priceZAR}
                onChange={(e) => setFormData(prev => ({ ...prev, priceZAR: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Original Price (Crossout)</label>
              <input
                type="number"
                min={0}
                value={formData.originalPriceZAR || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPriceZAR: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Warranty (Months)</label>
              <input
                type="number"
                min={0}
                max={36}
                value={formData.warrantyMonths}
                onChange={(e) => setFormData(prev => ({ ...prev, warrantyMonths: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Units in Stock</label>
              <input
                type="number"
                min={1}
                value={formData.stockCount}
                onChange={(e) => setFormData(prev => ({ ...prev, stockCount: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Location & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">Location City</label>
              <input
                type="text"
                required
                value={formData.locationCity}
                onChange={(e) => setFormData(prev => ({ ...prev, locationCity: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">Province</label>
              <select
                value={formData.locationProvince}
                onChange={(e: any) => setFormData(prev => ({ ...prev, locationProvince: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {SA_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">Delivery Courier Fee (ZAR)</label>
              <input
                type="number"
                min={0}
                value={formData.deliveryCostZAR}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryCostZAR: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Image Presets & URL */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px] flex items-center justify-between">
              <span>Part Image URL</span>
              <span className="text-slate-400 font-normal">Click preset or enter custom image URL</span>
            </label>
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
              {SAMPLE_PART_IMAGES.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData(prev => ({ ...prev, images: [img.url] }))}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] whitespace-nowrap transition-all ${
                    formData.images[0] === img.url 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              required
              value={formData.images[0] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, images: [e.target.value] }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1 text-[11px]">
              Detailed Condition & Fitment Notes
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detail compression test, gear shift test, includes wiring harness, scratches/wear, fitment recommendations..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
            />
          </div>

          {/* Featured Listing Toggle */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-white text-xs block">Spotlight Featured Listing</span>
                <span className="text-[11px] text-slate-400">Pushes this part to top of buyer search results</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <div>
              {editingListing && (
                <div>
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                      title="Permanently remove this listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Listing</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/50 p-1.5 rounded-xl">
                      <span className="text-[11px] text-red-300 font-bold pl-1">Permanently delete?</span>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={async () => {
                          if (!editingListing) return;
                          setIsDeleting(true);
                          try {
                            await deleteListing(editingListing.id);
                            setIsAddEditModalOpen(false);
                            setEditingListing(null);
                            setConfirmDelete(false);
                          } finally {
                            setIsDeleting(false);
                          }
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddEditModalOpen(false);
                  setEditingListing(null);
                  setConfirmDelete(false);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20"
              >
                {editingListing ? 'Save Changes' : 'Publish Listing'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
