export type UserRole = 'buyer' | 'seller' | 'admin' | 'owner';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending_verification';
  joinedDate: string;
  province: SouthAfricanProvince;
  city: string;
  associatedBusinessName?: string;
  ordersCount: number;
  totalSpentZAR: number;
  lastActive: string;
  notes?: string;
}

export interface RolePermissionDefinition {
  module: string;
  description: string;
  buyer: boolean;
  seller: boolean;
  admin: boolean;
  notes?: string;
}

export type VehicleType = 'car' | 'bakkie' | 'truck' | 'suv' | 'commercial';

export type PartCondition = 
  | 'Brand New OEM' 
  | 'Brand New Aftermarket' 
  | 'Reconditioned / Tested' 
  | 'Used Original (Clean)' 
  | 'Scrap Stripping (Used)';

export type PartCategory = 
  | 'Engine & Mechanical'
  | 'Gearbox & Drivetrain'
  | 'Brakes & Hubs'
  | 'Suspension & Steering'
  | 'Body Panels & Bumpers'
  | 'Auto Electrical & ECUs'
  | 'Cooling & Radiators'
  | 'Lighting & Mirrors'
  | 'Turbochargers & Fuel'
  | 'Truck Heavy Duty Axles'
  | 'Tires & Wheels'
  | 'Hydraulic Systems';

export type SouthAfricanProvince = 
  | 'Gauteng'
  | 'Western Cape'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Free State'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'North West'
  | 'Northern Cape';

export type SellerTier = 'starter' | 'pro' | 'enterprise' | 'network';

export interface SubscriptionDiscount {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'trial_days';
  discountValue: number;
  applicableTiers: ('all' | SellerTier)[];
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  isFeaturedOnCheckout: boolean;
  badgeText?: string;
  bannerMessage?: string;
  createdAt: string;
  createdBy?: string;
}

export interface SubscriptionPlan {
  id: SellerTier;
  name: string;
  tagline?: string;
  description?: string;
  priceMonthlyZAR: number;
  priceAnnualMonthlyZAR?: number;
  listingLimit: number;
  featuredListingsLimit: number;
  commissionFee: string;
  badgeName: string;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
  isNew?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  partNumber: string;
  oemNumber?: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engineSpec?: string;
  vehicleType: VehicleType;
  category: PartCategory;
  condition: PartCondition;
  priceZAR: number;
  originalPriceZAR?: number;
  warrantyMonths: number;
  stockCount: number;
  locationCity: string;
  locationProvince: SouthAfricanProvince;
  images: string[];
  description: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsApp: string;
  sellerEmail: string;
  sellerRating: number;
  sellerVerified: boolean;
  isFeatured: boolean;
  dateAdded: string;
  views: number;
  inquiriesCount: number;
  isNationwideDelivery: boolean;
  deliveryDaysEstimate: string;
  deliveryCostZAR: number;
}

export interface SellerAccount {
  id: string;
  businessName: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp: string;
  province: SouthAfricanProvince;
  city: string;
  address: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  subscriptionTier: SellerTier;
  subscriptionStatus: 'active' | 'past_due' | 'trial';
  subscriptionRenewsAt: string;
  joinedDate: string;
  totalSalesZAR: number;
  activeListingsCount: number;
  bannerImg?: string;
  logoImg?: string;
}

export interface Order {
  id: string;
  listingId: string;
  partTitle: string;
  partNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  amountZAR: number;
  deliveryFeeZAR: number;
  totalAmountZAR: number;
  status: 'pending' | 'confirmed' | 'dispatched' | 'completed' | 'cancelled';
  paymentMethod: 'EFT / Bank Transfer' | 'PayFast / Card' | 'Cash on Collection';
  paymentStatus: 'paid' | 'pending_verification' | 'unpaid';
  deliveryAddress: string;
  province: SouthAfricanProvince;
  notes?: string;
  createdAt: string;
}

export interface BuyerInquiry {
  id: string;
  listingId: string;
  partTitle: string;
  sellerId: string;
  sellerName: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  message: string;
  channel?: 'whatsapp' | 'web_form' | 'phone';
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

export type WhatsAppIntentType = 
  | 'availability' 
  | 'condition_photos' 
  | 'vin_fitment' 
  | 'courier_quote' 
  | 'collection' 
  | 'fleet_pricing' 
  | 'general';

export interface WhatsAppModalData {
  listing?: Listing;
  customSeller?: {
    id?: string;
    name: string;
    phone: string;
    whatsapp: string;
    locationCity?: string;
    locationProvince?: string;
  };
  defaultIntent?: WhatsAppIntentType;
}

export interface AppBankingDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  branchName: string;
  accountType: 'Business Cheque' | 'Current Account' | 'Corporate Transmission';
  swiftCode: string;
  referenceFormat: string;
  vatRegistrationNumber: string;
  sellerFeeNotice: string;
  supportContact: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface WebLinkModalData {
  initialSearch?: string;
  initialMake?: string;
  initialModel?: string;
  initialCategory?: string;
  initialProvince?: string;
  initialPartId?: string;
  initialSellerId?: string;
  customTitle?: string;
}

export interface VehicleFilterState {
  search: string;
  make: string;
  model: string;
  year: string;
  vehicleType: string;
  category: string;
  province: string;
  condition: string;
  minPrice: number | '';
  maxPrice: number | '';
  verifiedOnly: boolean;
  featuredOnly: boolean;
  inStockOnly: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'rating';
}
