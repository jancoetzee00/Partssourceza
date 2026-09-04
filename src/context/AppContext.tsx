import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  Listing, 
  SellerAccount, 
  AppBankingDetails, 
  Order, 
  BuyerInquiry, 
  VehicleFilterState,
  SellerTier,
  SouthAfricanProvince,
  PlatformUser,
  WhatsAppModalData,
  WhatsAppIntentType,
  SubscriptionDiscount,
  WebLinkModalData
} from '../types';
import { 
  INITIAL_LISTINGS, 
  INITIAL_SELLERS, 
  INITIAL_BANKING_DETAILS, 
  INITIAL_ORDERS, 
  INITIAL_INQUIRIES,
  INITIAL_PLATFORM_USERS,
  INITIAL_SUBSCRIPTION_DISCOUNTS,
  SUBSCRIPTION_PLANS
} from '../data/mockData';
import { 
  db, 
  auth, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  writeBatch 
} from 'firebase/firestore';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isDevApp: boolean;
  setIsDevApp: (val: boolean) => void;
  firebaseConnected: boolean;
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'dateAdded' | 'views' | 'inquiriesCount'>) => Listing;
  bulkAddOrUpdateListings: (
    items: Omit<Listing, 'id' | 'dateAdded' | 'views' | 'inquiriesCount'>[], 
    strategy?: 'upsert' | 'append' | 'skip_existing'
  ) => Promise<{ added: number; updated: number; skipped: number }>;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => Promise<void> | void;
  sellers: SellerAccount[];
  currentSeller: SellerAccount;
  setCurrentSellerId: (id: string) => void;
  updateSellerSubscription: (sellerId: string, tier: SellerTier) => void;
  updateSellerStatus: (sellerId: string, status: 'active' | 'past_due' | 'trial', verified?: boolean) => void;
  subscriptionDiscounts: SubscriptionDiscount[];
  addSubscriptionDiscount: (discount: Omit<SubscriptionDiscount, 'id' | 'createdAt' | 'usageCount'>) => SubscriptionDiscount;
  updateSubscriptionDiscount: (id: string, updates: Partial<SubscriptionDiscount>) => void;
  deleteSubscriptionDiscount: (id: string) => void;
  toggleDiscountActive: (id: string) => void;
  toggleDiscountFeatured: (id: string) => void;
  validateAndApplyPromoCode: (code: string, tier: SellerTier) => { 
    valid: boolean; 
    discount?: SubscriptionDiscount; 
    finalPriceZAR?: number; 
    discountAmountZAR?: number; 
    message?: string 
  };
  users: PlatformUser[];
  updateUserStatus: (userId: string, status: 'active' | 'suspended' | 'pending_verification') => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUser: (userId: string, updates: Partial<PlatformUser>) => void;
  addUser: (userData: Omit<PlatformUser, 'id' | 'joinedDate'>) => PlatformUser;
  deleteUser: (userId: string) => void;
  bankingDetails: AppBankingDetails;
  updateBankingDetails: (details: Partial<AppBankingDetails>) => void;
  compareList: Listing[];
  addToCompare: (listing: Listing) => void;
  removeFromCompare: (listingId: string) => void;
  clearCompare: () => void;
  isInCompare: (listingId: string) => boolean;
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  inquiries: BuyerInquiry[];
  createInquiry: (inquiryData: Omit<BuyerInquiry, 'id' | 'createdAt' | 'status'>) => BuyerInquiry;
  filters: VehicleFilterState;
  setFilters: React.Dispatch<React.SetStateAction<VehicleFilterState>>;
  resetFilters: () => void;
  selectedListing: Listing | null;
  setSelectedListing: (listing: Listing | null) => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
  isAddEditModalOpen: boolean;
  setIsAddEditModalOpen: (open: boolean) => void;
  isBulkUploadModalOpen: boolean;
  setIsBulkUploadModalOpen: (open: boolean) => void;
  editingListing: Listing | null;
  setEditingListing: (listing: Listing | null) => void;
  isSubscriptionModalOpen: boolean;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isRequestPartOpen: boolean;
  setIsRequestPartOpen: (open: boolean) => void;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (open: boolean) => void;
  isSearchEngineModalOpen: boolean;
  setIsSearchEngineModalOpen: (open: boolean) => void;
  isWebLinkModalOpen: boolean;
  setIsWebLinkModalOpen: (open: boolean) => void;
  webLinkModalData: WebLinkModalData | null;
  setWebLinkModalData: (data: WebLinkModalData | null) => void;
  openWebLinkGenerator: (data?: WebLinkModalData) => void;
  isSellerAuthModalOpen: boolean;
  setIsSellerAuthModalOpen: (open: boolean) => void;
  sellerAuthMode: 'login' | 'register';
  setSellerAuthMode: (mode: 'login' | 'register') => void;
  openSellerAuth: (mode?: 'login' | 'register') => void;
  registerNewSeller: (newSellerData: {
    businessName: string;
    registrationNumber?: string;
    contactPerson: string;
    email: string;
    phone: string;
    whatsapp: string;
    province: SouthAfricanProvince;
    city: string;
    address?: string;
    subscriptionTier?: SellerTier;
    billingCycle?: 'monthly' | 'annual';
    promoCode?: string;
  }) => SellerAccount;
  loginSeller: (sellerId: string) => boolean;
  loginSellerByCredentials: (identifier: string, passwordOrPin?: string) => { success: boolean; message?: string; seller?: SellerAccount };
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  authenticateAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  isWhatsAppModalOpen: boolean;
  setIsWhatsAppModalOpen: (open: boolean) => void;
  whatsAppModalData: WhatsAppModalData | null;
  setWhatsAppModalData: (data: WhatsAppModalData | null) => void;
  openWhatsAppChat: (listing?: Listing, defaultIntent?: WhatsAppIntentType, customSeller?: WhatsAppModalData['customSeller']) => void;
  canInstallPWA: boolean;
  triggerPWAInstall: () => Promise<boolean>;
  detectedPlatform: 'android' | 'ios' | 'windows' | 'mac' | 'linux';
  activeNotification: { title: string; message: string; type?: 'success' | 'info' | 'warning' } | null;
  showNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

const defaultFilters: VehicleFilterState = {
  search: '',
  make: '',
  model: '',
  year: '',
  yearMin: '',
  yearMax: '',
  vehicleType: '',
  category: '',
  province: '',
  condition: '',
  conditionGroup: '',
  minPrice: '',
  maxPrice: '',
  verifiedOnly: false,
  featuredOnly: false,
  inStockOnly: false,
  sortBy: 'newest'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('buyer');
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);
  
  // Detect if running in Dev App environment or explicit dev flag
  const [isDevApp, setIsDevApp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const href = window.location.href;
      return (
        href.includes('dev=true') || 
        localStorage.getItem('partsource_dev_mode') === 'true'
      );
    }
    return false;
  });

  // Persistent listings with Firestore real-time sync & local fallback
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem('partsource_listings');
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  // Persistent users
  const [users, setUsers] = useState<PlatformUser[]>(() => {
    try {
      const saved = localStorage.getItem('partsource_users');
      return saved ? JSON.parse(saved) : INITIAL_PLATFORM_USERS;
    } catch {
      return INITIAL_PLATFORM_USERS;
    }
  });

  // Persistent sellers
  const [sellers, setSellers] = useState<SellerAccount[]>(() => {
    try {
      const saved = localStorage.getItem('partsource_sellers');
      return saved ? JSON.parse(saved) : INITIAL_SELLERS;
    } catch {
      return INITIAL_SELLERS;
    }
  });

  const [currentSellerId, setCurrentSellerId] = useState<string>('seller-jhb-01');

  // Persistent subscription discounts & promotional specials
  const [subscriptionDiscounts, setSubscriptionDiscounts] = useState<SubscriptionDiscount[]>(() => {
    try {
      const saved = localStorage.getItem('partsource_subscription_discounts');
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION_DISCOUNTS;
    } catch {
      return INITIAL_SUBSCRIPTION_DISCOUNTS;
    }
  });

  // Persistent banking details
  const [bankingDetails, setBankingDetails] = useState<AppBankingDetails>(() => {
    try {
      const saved = localStorage.getItem('partsource_banking_details');
      return saved ? JSON.parse(saved) : INITIAL_BANKING_DETAILS;
    } catch {
      return INITIAL_BANKING_DETAILS;
    }
  });

  // Persistent orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('partsource_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Persistent buyer inquiries
  const [inquiries, setInquiries] = useState<BuyerInquiry[]>(() => {
    try {
      const saved = localStorage.getItem('partsource_inquiries');
      return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
    } catch {
      return INITIAL_INQUIRIES;
    }
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('partsource_favorites');
      return saved ? JSON.parse(saved) : ['part-001', 'part-005'];
    } catch {
      return [];
    }
  });

  // Comparison tray
  const [compareList, setCompareList] = useState<Listing[]>([]);

  // Filtering state
  const [filters, setFilters] = useState<VehicleFilterState>(defaultFilters);

  // Modals state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isRequestPartOpen, setIsRequestPartOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isSearchEngineModalOpen, setIsSearchEngineModalOpen] = useState<boolean>(false);
  const [isWebLinkModalOpen, setIsWebLinkModalOpen] = useState<boolean>(false);
  const [webLinkModalData, setWebLinkModalData] = useState<WebLinkModalData | null>(null);

  const openWebLinkGenerator = (data?: WebLinkModalData) => {
    if (data) {
      setWebLinkModalData(data);
    } else {
      setWebLinkModalData({
        initialSearch: filters.search,
        initialMake: filters.make,
        initialModel: filters.model,
        initialCategory: filters.category,
        initialProvince: filters.province,
        initialPartId: selectedListing?.id || ''
      });
    }
    setIsWebLinkModalOpen(true);
  };

  // Seller Auth Modal & Onboarding State
  const [isSellerAuthModalOpen, setIsSellerAuthModalOpen] = useState<boolean>(false);
  const [sellerAuthMode, setSellerAuthMode] = useState<'login' | 'register'>('login');

  const openSellerAuth = (mode: 'login' | 'register' = 'login') => {
    setSellerAuthMode(mode);
    setIsSellerAuthModalOpen(true);
  };

  const loginSeller = (sellerId: string): boolean => {
    const target = sellers.find(s => s.id === sellerId);
    if (target) {
      setCurrentSellerId(sellerId);
      setRole('seller');
      setIsSellerAuthModalOpen(false);
      showNotification('Seller Logged In', `Welcome back, ${target.businessName}!`, 'success');
      return true;
    }
    showNotification('Seller Not Found', 'Could not locate supplier account.', 'warning');
    return false;
  };

  const loginSellerByCredentials = (identifier: string, _passwordOrPin?: string): { success: boolean; message?: string; seller?: SellerAccount } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanNum = identifier.replace(/[^0-9]/g, '');

    const match = sellers.find(s => 
      s.id.toLowerCase() === cleanId ||
      s.email.toLowerCase() === cleanId ||
      s.businessName.toLowerCase().includes(cleanId) ||
      (cleanNum.length >= 7 && (s.phone.replace(/[^0-9]/g, '').includes(cleanNum) || s.whatsapp.includes(cleanNum)))
    );

    if (match) {
      setCurrentSellerId(match.id);
      setRole('seller');
      setIsSellerAuthModalOpen(false);
      showNotification('Seller Authenticated', `Signed in as ${match.businessName} (${match.subscriptionTier.toUpperCase()} plan).`, 'success');
      return { success: true, seller: match };
    }

    showNotification('Sign In Failed', 'No matching supplier account found. Please check details or register.', 'warning');
    return { success: false, message: 'Supplier account not found for provided email/phone.' };
  };

  const registerNewSeller = (newSellerData: {
    businessName: string;
    registrationNumber?: string;
    contactPerson: string;
    email: string;
    phone: string;
    whatsapp: string;
    province: SouthAfricanProvince;
    city: string;
    address?: string;
    subscriptionTier?: SellerTier;
    billingCycle?: 'monthly' | 'annual';
    promoCode?: string;
  }): SellerAccount => {
    const newId = `seller-${newSellerData.province.toLowerCase().replace(/\s+/g, '').slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    const tier = newSellerData.subscriptionTier || 'pro';
    
    const newSeller: SellerAccount = {
      id: newId,
      businessName: newSellerData.businessName.trim(),
      registrationNumber: newSellerData.registrationNumber?.trim() || `${new Date().getFullYear()}/${Math.floor(Math.random() * 899999 + 100000)}/07`,
      contactPerson: newSellerData.contactPerson.trim(),
      email: newSellerData.email.trim().toLowerCase(),
      phone: newSellerData.phone.trim(),
      whatsapp: newSellerData.whatsapp.replace(/[^0-9]/g, '') || newSellerData.phone.replace(/[^0-9]/g, ''),
      province: newSellerData.province,
      city: newSellerData.city.trim(),
      address: newSellerData.address?.trim() || `${newSellerData.city}, ${newSellerData.province}`,
      rating: 5.0,
      totalReviews: 1,
      verified: true,
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionRenewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      joinedDate: new Date().toISOString().split('T')[0],
      totalSalesZAR: 0,
      activeListingsCount: 0
    };

    // Add to local state and switch
    setSellers(prev => [newSeller, ...prev]);
    setCurrentSellerId(newSeller.id);
    setRole('seller');
    setIsSellerAuthModalOpen(false);

    // Save to Firestore
    setDoc(doc(db, 'sellers', newSeller.id), newSeller).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `sellers/${newSeller.id}`);
    });

    // Also register user profile
    const newUserProfile: PlatformUser = {
      id: `usr-${newSeller.id}`,
      name: newSeller.contactPerson,
      email: newSeller.email,
      phone: newSeller.phone,
      role: 'seller',
      status: 'active',
      associatedBusinessName: newSeller.businessName,
      province: newSeller.province,
      city: newSeller.city,
      ordersCount: 0,
      totalSpentZAR: 0,
      lastActive: 'Just now',
      joinedDate: newSeller.joinedDate
    };
    setUsers(prev => [newUserProfile, ...prev]);
    setDoc(doc(db, 'users', newUserProfile.id), newUserProfile).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `users/${newUserProfile.id}`);
    });

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === tier);
    showNotification(
      'Supplier Account Created!', 
      `Welcome ${newSeller.businessName}! Activated on the ${plan?.name || tier} plan.`, 
      'success'
    );

    return newSeller;
  };
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('partsource_admin_authenticated') === 'true';
    }
    return false;
  });

  const ADMIN_PASSWORD = 'Mad006werk@';

  const authenticateAdmin = (enteredPassword: string): boolean => {
    if (enteredPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('partsource_admin_authenticated', 'true');
      }
      setRole('admin');
      setIsAdminAuthModalOpen(false);
      showNotification('Admin Authenticated', 'Master administrator privileges unlocked.', 'success');
      return true;
    } else {
      showNotification('Access Denied', 'Incorrect administrator password.', 'warning');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('partsource_admin_authenticated');
    }
    setRole('buyer');
    showNotification('Admin Session Locked', 'You have been logged out of the Administrator Hub.', 'info');
  };

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<WhatsAppModalData | null>(null);

  const openWhatsAppChat = (
    listing?: Listing, 
    defaultIntent?: WhatsAppIntentType, 
    customSeller?: WhatsAppModalData['customSeller']
  ) => {
    setWhatsAppModalData({
      listing,
      defaultIntent: defaultIntent || 'availability',
      customSeller
    });
    setIsWhatsAppModalOpen(true);
  };

  // Device & Platform Detection
  const [detectedPlatform, setDetectedPlatform] = useState<'android' | 'ios' | 'windows' | 'mac' | 'linux'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPWA, setCanInstallPWA] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator) {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        setDetectedPlatform('ios');
      } else if (/android/i.test(userAgent)) {
        setDetectedPlatform('android');
      } else if (/Win/i.test(userAgent)) {
        setDetectedPlatform('windows');
      } else if (/Mac/i.test(userAgent)) {
        setDetectedPlatform('mac');
      } else if (/Linux/i.test(userAgent)) {
        setDetectedPlatform('linux');
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Notifications
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    message: string;
    type?: 'success' | 'info' | 'warning';
  } | null>(null);

  const showNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setActiveNotification({ title, message, type });
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  };

  // URL SEARCH PARAMETERS PARSER & INITIALIZATION (Supports direct search links & deep-linking)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        
        const q = params.get('search') || params.get('q');
        const makeParam = params.get('make');
        const modelParam = params.get('model');
        const catParam = params.get('category') || params.get('cat');
        const provParam = params.get('province');
        const typeParam = params.get('type');
        const partParam = params.get('part') || params.get('partId');
        const sellerParam = params.get('seller') || params.get('sellerId');
        const roleParam = params.get('role');

        if (roleParam && (roleParam === 'buyer' || roleParam === 'seller' || roleParam === 'admin')) {
          setRole(roleParam as UserRole);
        }

        if (sellerParam) {
          setCurrentSellerId(sellerParam);
        }

        const yearParam = params.get('year');
        const condParam = params.get('condition');
        const condGroupParam = params.get('conditionGroup');
        const minPriceParam = params.get('minPrice');
        const maxPriceParam = params.get('maxPrice');

        if (q || makeParam || modelParam || catParam || provParam || typeParam || yearParam || condParam || condGroupParam || minPriceParam || maxPriceParam) {
          setFilters(prev => ({
            ...prev,
            ...(q ? { search: q } : {}),
            ...(makeParam ? { make: makeParam } : {}),
            ...(modelParam ? { model: modelParam } : {}),
            ...(catParam ? { category: catParam } : {}),
            ...(provParam ? { province: provParam } : {}),
            ...(typeParam ? { vehicleType: typeParam } : {}),
            ...(yearParam ? { year: yearParam } : {}),
            ...(condParam ? { condition: condParam } : {}),
            ...(condGroupParam ? { conditionGroup: condGroupParam as any } : {}),
            ...(minPriceParam ? { minPrice: Number(minPriceParam) } : {}),
            ...(maxPriceParam ? { maxPrice: Number(maxPriceParam) } : {})
          }));
        }

        if (partParam) {
          const match = listings.find(l => l.id === partParam);
          if (match) {
            setSelectedListing(match);
          }
        }
      } catch (err) {
        console.error('Error parsing URL parameters:', err);
      }
    }
  }, []);

  // Sync address bar URL with active search query without reload
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      try {
        const params = new URLSearchParams();

        if (filters.search) params.set('search', filters.search);
        if (filters.make) params.set('make', filters.make);
        if (filters.model) params.set('model', filters.model);
        if (filters.category) params.set('category', filters.category);
        if (filters.province) params.set('province', filters.province);
        if (filters.vehicleType) params.set('type', filters.vehicleType);
        if (selectedListing) params.set('part', selectedListing.id);
        if (role !== 'buyer') params.set('role', role);

        const newQuery = params.toString();
        const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      } catch (err) {
        // silent fallback
      }
    }
  }, [filters.search, filters.make, filters.model, filters.category, filters.province, filters.vehicleType, selectedListing?.id, role]);

  // FIRESTORE LIVE REAL-TIME LISTENERS & INITIAL CLOUD SEEDING
  useEffect(() => {
    let unsubListings: (() => void) | null = null;
    let unsubSellers: (() => void) | null = null;
    let unsubOrders: (() => void) | null = null;
    let unsubInquiries: (() => void) | null = null;
    let unsubUsers: (() => void) | null = null;
    let unsubBanking: (() => void) | null = null;
    let unsubDiscounts: (() => void) | null = null;

    try {
      // 1. Listings Real-time Listener
      unsubListings = onSnapshot(collection(db, 'listings'), (snapshot) => {
        if (!snapshot.empty) {
          const cloudListings: Listing[] = [];
          snapshot.forEach((docSnap) => {
            cloudListings.push({ ...(docSnap.data() as Listing), id: docSnap.id });
          });
          setListings(cloudListings);
        } else {
          // Seed cloud database on initial run
          INITIAL_LISTINGS.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'listings', item.id), item);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `listings/${item.id}`);
            }
          });
        }
        setFirebaseConnected(true);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'listings');
      });

      // 2. Sellers Real-time Listener
      unsubSellers = onSnapshot(collection(db, 'sellers'), (snapshot) => {
        if (!snapshot.empty) {
          const cloudSellers: SellerAccount[] = [];
          snapshot.forEach((docSnap) => {
            cloudSellers.push({ ...(docSnap.data() as SellerAccount), id: docSnap.id });
          });
          setSellers(cloudSellers);
        } else {
          INITIAL_SELLERS.forEach(async (seller) => {
            try {
              await setDoc(doc(db, 'sellers', seller.id), seller);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `sellers/${seller.id}`);
            }
          });
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'sellers');
      });

      // 3. Orders Real-time Listener
      unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        if (!snapshot.empty) {
          const cloudOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            cloudOrders.push({ ...(docSnap.data() as Order), id: docSnap.id });
          });
          setOrders(cloudOrders);
        } else {
          INITIAL_ORDERS.forEach(async (order) => {
            try {
              await setDoc(doc(db, 'orders', order.id), order);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
            }
          });
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'orders');
      });

      // 4. Inquiries Real-time Listener
      unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
        if (!snapshot.empty) {
          const cloudInquiries: BuyerInquiry[] = [];
          snapshot.forEach((docSnap) => {
            cloudInquiries.push({ ...(docSnap.data() as BuyerInquiry), id: docSnap.id });
          });
          setInquiries(cloudInquiries);
        } else {
          INITIAL_INQUIRIES.forEach(async (inq) => {
            try {
              await setDoc(doc(db, 'inquiries', inq.id), inq);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `inquiries/${inq.id}`);
            }
          });
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'inquiries');
      });

      // 5. Users Real-time Listener
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        if (!snapshot.empty) {
          const cloudUsers: PlatformUser[] = [];
          snapshot.forEach((docSnap) => {
            cloudUsers.push({ ...(docSnap.data() as PlatformUser), id: docSnap.id });
          });
          setUsers(cloudUsers);
        } else {
          INITIAL_PLATFORM_USERS.forEach(async (u) => {
            try {
              await setDoc(doc(db, 'users', u.id), u);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${u.id}`);
            }
          });
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'users');
      });

      // 6. Banking System Listener
      unsubBanking = onSnapshot(doc(db, 'system', 'banking'), (docSnap) => {
        if (docSnap.exists()) {
          setBankingDetails(docSnap.data() as AppBankingDetails);
        } else {
          setDoc(doc(db, 'system', 'banking'), INITIAL_BANKING_DETAILS).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, 'system/banking');
          });
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'system/banking');
      });

      // 7. Subscription Discounts System Listener
      unsubDiscounts = onSnapshot(doc(db, 'system', 'subscription_discounts'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.discounts)) {
            setSubscriptionDiscounts(data.discounts as SubscriptionDiscount[]);
          }
        } else {
          setDoc(doc(db, 'system', 'subscription_discounts'), {
            discounts: INITIAL_SUBSCRIPTION_DISCOUNTS,
            lastUpdated: new Date().toISOString()
          }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, 'system/subscription_discounts');
          });
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'system/subscription_discounts');
      });

    } catch (err) {
      console.warn('Firebase initialization notice:', err);
    }

    return () => {
      if (unsubListings) unsubListings();
      if (unsubSellers) unsubSellers();
      if (unsubOrders) unsubOrders();
      if (unsubInquiries) unsubInquiries();
      if (unsubUsers) unsubUsers();
      if (unsubBanking) unsubBanking();
      if (unsubDiscounts) unsubDiscounts();
    };
  }, []);

  // Sync to local storage for instant offline loading
  useEffect(() => {
    localStorage.setItem('partsource_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('partsource_sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('partsource_subscription_discounts', JSON.stringify(subscriptionDiscounts));
  }, [subscriptionDiscounts]);

  useEffect(() => {
    localStorage.setItem('partsource_banking_details', JSON.stringify(bankingDetails));
  }, [bankingDetails]);

  useEffect(() => {
    localStorage.setItem('partsource_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('partsource_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('partsource_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('partsource_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('partsource_dev_mode', isDevApp ? 'true' : 'false');
  }, [isDevApp]);

  // Current active seller
  const currentSeller = sellers.find(s => s.id === currentSellerId) || sellers[0];

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const addListing = (listingData: Omit<Listing, 'id' | 'dateAdded' | 'views' | 'inquiriesCount'>): Listing => {
    const newListing: Listing = {
      ...listingData,
      id: `part-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
      dateAdded: new Date().toISOString().split('T')[0],
      views: 1,
      inquiriesCount: 0
    };
    
    // Update local state immediately
    setListings(prev => [newListing, ...prev]);
    setSellers(prev => prev.map(s => s.id === listingData.sellerId ? { ...s, activeListingsCount: s.activeListingsCount + 1 } : s));

    // Save to Firestore
    setDoc(doc(db, 'listings', newListing.id), newListing).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `listings/${newListing.id}`);
    });

    showNotification('Listing Created', `"${newListing.title}" is saved to Firestore & searchable.`, 'success');
    return newListing;
  };

  const bulkAddOrUpdateListings = async (
    items: Omit<Listing, 'id' | 'dateAdded' | 'views' | 'inquiriesCount'>[], 
    strategy: 'upsert' | 'append' | 'skip_existing' = 'upsert'
  ): Promise<{ added: number; updated: number; skipped: number }> => {
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const currentListingsMap = new Map<string, Listing>();
    listings.forEach(l => {
      // Key by sellerId + partNumber for unique identification
      currentListingsMap.set(`${l.sellerId}_${l.partNumber.toLowerCase()}`, l);
    });

    const newListingsToAdd: Listing[] = [];
    const updatedListingsMap = new Map<string, Listing>();
    const firestoreBatch = writeBatch(db);

    items.forEach((item, index) => {
      const matchKey = `${item.sellerId}_${item.partNumber.toLowerCase()}`;
      const existing = currentListingsMap.get(matchKey);

      if (existing && strategy === 'skip_existing') {
        skippedCount++;
        return;
      }

      if (existing && strategy === 'upsert') {
        const merged: Listing = {
          ...existing,
          ...item,
          id: existing.id,
          dateAdded: existing.dateAdded,
          views: existing.views,
          inquiriesCount: existing.inquiriesCount
        };
        updatedListingsMap.set(existing.id, merged);
        updatedCount++;

        const ref = doc(db, 'listings', existing.id);
        firestoreBatch.set(ref, merged, { merge: true });
      } else {
        // Append or new item
        const newId = `part-${Date.now().toString().slice(-4)}-${index + 100}-${Math.floor(Math.random() * 899 + 100)}`;
        const created: Listing = {
          ...item,
          id: newId,
          dateAdded: new Date().toISOString().split('T')[0],
          views: 1,
          inquiriesCount: 0
        };
        newListingsToAdd.push(created);
        addedCount++;

        const ref = doc(db, 'listings', newId);
        firestoreBatch.set(ref, created);
      }
    });

    // Commit to Firestore in background
    firestoreBatch.commit().catch(err => {
      handleFirestoreError(err, OperationType.WRITE, 'listings/bulk_batch');
    });

    // Update local React state
    setListings(prev => {
      // 1. Update existing
      const updatedPrev = prev.map(l => updatedListingsMap.get(l.id) || l);
      // 2. Prepend newly added
      return [...newListingsToAdd, ...updatedPrev];
    });

    // Update seller activeListingsCount
    if (addedCount > 0 && items.length > 0) {
      const primarySellerId = items[0].sellerId;
      setSellers(prev => prev.map(s => s.id === primarySellerId ? { ...s, activeListingsCount: s.activeListingsCount + addedCount } : s));
    }

    return { added: addedCount, updated: updatedCount, skipped: skippedCount };
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    if (selectedListing && selectedListing.id === id) {
      setSelectedListing(prev => prev ? { ...prev, ...updates } : null);
    }

    // Update in Firestore
    updateDoc(doc(db, 'listings', id), updates).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `listings/${id}`);
    });

    showNotification('Listing Updated', 'Part details synced to Firebase Firestore.', 'success');
  };

  const deleteListing = async (id: string): Promise<void> => {
    const toDelete = listings.find(l => l.id === id);
    // Optimistically update local state immediately
    setListings(prev => prev.filter(item => item.id !== id));
    setCompareList(prev => prev.filter(item => item.id !== id));
    if (selectedListing?.id === id) setSelectedListing(null);
    if (toDelete) {
      setSellers(prev => prev.map(s => s.id === toDelete.sellerId ? { ...s, activeListingsCount: Math.max(0, s.activeListingsCount - 1) } : s));
    }

    try {
      // Delete in Firestore
      await deleteDoc(doc(db, 'listings', id));
      showNotification('Listing Deleted', 'The listing has been permanently removed from Firebase Firestore.', 'warning');
    } catch (err) {
      console.warn('Firestore deletion error:', err);
      showNotification('Listing Removed', 'The listing was removed from your active session.', 'info');
    }
  };

  const updateSellerSubscription = (sellerId: string, tier: SellerTier) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === tier);
    const updates = {
      subscriptionTier: tier,
      subscriptionStatus: 'active' as const,
      subscriptionRenewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, ...updates } : s));

    // Firestore update
    updateDoc(doc(db, 'sellers', sellerId), updates).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `sellers/${sellerId}`);
    });

    showNotification('Subscription Activated', `Subscribed to ${plan?.name || tier} (R${plan?.priceMonthlyZAR || 0}/month).`, 'success');
  };

  const updateSellerStatus = (sellerId: string, status: 'active' | 'past_due' | 'trial', verified?: boolean) => {
    const updates = {
      subscriptionStatus: status,
      ...(verified !== undefined ? { verified } : {})
    };

    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, ...updates } : s));

    updateDoc(doc(db, 'sellers', sellerId), updates).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `sellers/${sellerId}`);
    });

    showNotification('Seller Status Updated', `Seller ${sellerId} status set to ${status}.`, 'info');
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended' | 'pending_verification') => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    updateDoc(doc(db, 'users', userId), { status }).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    });
    showNotification('User Status Updated', `User account status changed to ${status}.`, 'info');
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    updateDoc(doc(db, 'users', userId), { role: newRole }).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    });
    showNotification('User Role Updated', `User permissions updated to ${newRole.toUpperCase()}.`, 'success');
  };

  const updateUser = (userId: string, updates: Partial<PlatformUser>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    updateDoc(doc(db, 'users', userId), updates).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    });
    showNotification('User Updated', 'User profile and permissions saved.', 'success');
  };

  const addUser = (userData: Omit<PlatformUser, 'id' | 'joinedDate'>): PlatformUser => {
    const newUser: PlatformUser = {
      ...userData,
      id: `user-${Date.now().toString().slice(-4)}`,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [newUser, ...prev]);
    setDoc(doc(db, 'users', newUser.id), newUser).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `users/${newUser.id}`);
    });
    showNotification('User Registered', `Account created for ${newUser.name}.`, 'success');
    return newUser;
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    deleteDoc(doc(db, 'users', userId)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    });
    showNotification('User Deleted', 'User account permanently removed from registry.', 'warning');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    updateDoc(doc(db, 'orders', orderId), { status }).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    });
    showNotification('Order Updated', `Order #${orderId} status changed to ${status.toUpperCase()}.`, 'info');
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: Order['paymentStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o));
    updateDoc(doc(db, 'orders', orderId), { paymentStatus }).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    });
    showNotification('Payment Verified', `Order #${orderId} payment status set to ${paymentStatus.toUpperCase()}.`, 'success');
  };

  const updateBankingDetails = (details: Partial<AppBankingDetails>) => {
    const updated: AppBankingDetails = {
      ...bankingDetails,
      ...details,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Platform Owner (Dev App Config)'
    };
    setBankingDetails(updated);
    setDoc(doc(db, 'system', 'banking'), updated).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, 'system/banking');
    });
    showNotification('Banking Details Updated', 'Part Source ZA official receiving bank details updated in Firestore.', 'success');
  };

  const addToCompare = (listing: Listing) => {
    if (compareList.some(item => item.id === listing.id)) {
      return;
    }
    if (compareList.length >= 4) {
      showNotification('Comparison Limit', 'You can compare up to 4 vehicle parts at once.', 'warning');
      return;
    }
    setCompareList(prev => [...prev, listing]);
    showNotification('Added to Comparison', `"${listing.title.slice(0, 30)}..." added to comparison matrix.`, 'info');
  };

  const removeFromCompare = (listingId: string) => {
    setCompareList(prev => prev.filter(item => item.id !== listingId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (listingId: string) => {
    return compareList.some(item => item.id === listingId);
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => {
      if (prev.includes(listingId)) {
        showNotification('Removed from Saved', 'Part removed from your saved list.', 'info');
        return prev.filter(id => id !== listingId);
      } else {
        showNotification('Saved Part', 'Added to your favorites list.', 'success');
        return [...prev, listingId];
      }
    });
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-ZA-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`);
    });
    showNotification('Order Placed Successfully', `Order #${newOrder.id} has been transmitted to ${orderData.sellerName}.`, 'success');
    return newOrder;
  };

  const createInquiry = (inquiryData: Omit<BuyerInquiry, 'id' | 'createdAt' | 'status'>): BuyerInquiry => {
    const newInquiry: BuyerInquiry = {
      ...inquiryData,
      id: `INQ-${Math.floor(100 + Math.random() * 900)}`,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    setInquiries(prev => [newInquiry, ...prev]);
    setDoc(doc(db, 'inquiries', newInquiry.id), newInquiry).catch(err => {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${newInquiry.id}`);
    });
    // increment listing inquiry count
    setListings(prev => prev.map(l => l.id === inquiryData.listingId ? { ...l, inquiriesCount: l.inquiriesCount + 1 } : l));
    updateDoc(doc(db, 'listings', inquiryData.listingId), {
      inquiriesCount: (listings.find(l => l.id === inquiryData.listingId)?.inquiriesCount || 0) + 1
    }).catch(() => {});
    showNotification('Inquiry Sent', `Your message was delivered to ${inquiryData.sellerName}.`, 'success');
    return newInquiry;
  };

  const triggerPWAInstall = async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          showNotification('Installation Started', 'Part Source ZA is installing on your device.', 'success');
          setDeferredPrompt(null);
          setCanInstallPWA(false);
          return true;
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    }
    return false;
  };

  const saveSubscriptionDiscountsToCloud = (discountsList: SubscriptionDiscount[]) => {
    setSubscriptionDiscounts(discountsList);
    setDoc(doc(db, 'system', 'subscription_discounts'), {
      discounts: discountsList,
      lastUpdated: new Date().toISOString()
    }).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, 'system/subscription_discounts');
    });
  };

  const addSubscriptionDiscount = (discountData: Omit<SubscriptionDiscount, 'id' | 'createdAt' | 'usageCount'>): SubscriptionDiscount => {
    const newDiscount: SubscriptionDiscount = {
      ...discountData,
      id: `disc-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      code: discountData.code.trim().toUpperCase(),
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newDiscount, ...subscriptionDiscounts];
    saveSubscriptionDiscountsToCloud(updated);
    showNotification('Special Created', `Promo code ${newDiscount.code} is now live and ready.`, 'success');
    return newDiscount;
  };

  const updateSubscriptionDiscount = (id: string, updates: Partial<SubscriptionDiscount>) => {
    const updated = subscriptionDiscounts.map(d => {
      if (d.id === id) {
        return {
          ...d,
          ...updates,
          code: updates.code ? updates.code.trim().toUpperCase() : d.code
        };
      }
      return d;
    });
    saveSubscriptionDiscountsToCloud(updated);
    showNotification('Special Updated', 'Subscription discount rules saved.', 'success');
  };

  const deleteSubscriptionDiscount = (id: string) => {
    const updated = subscriptionDiscounts.filter(d => d.id !== id);
    saveSubscriptionDiscountsToCloud(updated);
    showNotification('Special Removed', 'Subscription discount code was deleted.', 'warning');
  };

  const toggleDiscountActive = (id: string) => {
    const target = subscriptionDiscounts.find(d => d.id === id);
    if (!target) return;
    const updated = subscriptionDiscounts.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
    saveSubscriptionDiscountsToCloud(updated);
    showNotification(
      !target.isActive ? 'Special Activated' : 'Special Paused',
      `Promo code ${target.code} is now ${!target.isActive ? 'active' : 'paused'}.`,
      'info'
    );
  };

  const toggleDiscountFeatured = (id: string) => {
    const target = subscriptionDiscounts.find(d => d.id === id);
    if (!target) return;
    const updated = subscriptionDiscounts.map(d => d.id === id ? { ...d, isFeaturedOnCheckout: !d.isFeaturedOnCheckout } : d);
    saveSubscriptionDiscountsToCloud(updated);
    showNotification(
      !target.isFeaturedOnCheckout ? 'Featured on Checkout' : 'Unfeatured from Checkout',
      `Special "${target.title}" ${!target.isFeaturedOnCheckout ? 'will be highlighted' : 'hidden'} on seller checkout.`,
      'success'
    );
  };

  const validateAndApplyPromoCode = (
    code: string, 
    tier: SellerTier
  ): { 
    valid: boolean; 
    discount?: SubscriptionDiscount; 
    finalPriceZAR?: number; 
    discountAmountZAR?: number; 
    message?: string 
  } => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, message: 'Please enter a promo code.' };
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === tier);
    if (!plan) {
      return { valid: false, message: 'Invalid subscription tier selected.' };
    }

    const discount = subscriptionDiscounts.find(d => d.code.toUpperCase() === cleanCode);
    if (!discount) {
      return { valid: false, message: `Promo code "${cleanCode}" was not found.` };
    }

    if (!discount.isActive) {
      return { valid: false, message: `Promo code "${cleanCode}" is currently inactive or paused.` };
    }

    if (discount.validUntil && new Date(discount.validUntil).getTime() < new Date().setHours(0,0,0,0)) {
      return { valid: false, message: `Promo code "${cleanCode}" expired on ${discount.validUntil}.` };
    }

    if (discount.usageLimit > 0 && discount.usageCount >= discount.usageLimit) {
      return { valid: false, message: `Promo code "${cleanCode}" has reached its maximum redemptions (${discount.usageLimit}).` };
    }

    const tierMatches = discount.applicableTiers.includes('all') || discount.applicableTiers.includes(tier);
    if (!tierMatches) {
      return { 
        valid: false, 
        message: `Promo code "${cleanCode}" is only applicable to ${discount.applicableTiers.map(t => t.toUpperCase()).join(', ')} tiers.` 
      };
    }

    let discountAmountZAR = 0;
    let finalPriceZAR = plan.priceMonthlyZAR;

    if (discount.discountType === 'percentage') {
      discountAmountZAR = Math.round((plan.priceMonthlyZAR * discount.discountValue) / 100);
      finalPriceZAR = Math.max(0, plan.priceMonthlyZAR - discountAmountZAR);
    } else if (discount.discountType === 'fixed_amount') {
      discountAmountZAR = Math.min(plan.priceMonthlyZAR, discount.discountValue);
      finalPriceZAR = Math.max(0, plan.priceMonthlyZAR - discountAmountZAR);
    } else if (discount.discountType === 'trial_days') {
      discountAmountZAR = 0;
      finalPriceZAR = plan.priceMonthlyZAR;
    }

    return {
      valid: true,
      discount,
      finalPriceZAR,
      discountAmountZAR,
      message: discount.discountType === 'trial_days'
        ? `Applied! You get ${discount.discountValue} extra free trial days.`
        : `Applied! You save R${discountAmountZAR} with "${cleanCode}".`
    };
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isDevApp,
        setIsDevApp,
        firebaseConnected,
        listings,
        addListing,
        bulkAddOrUpdateListings,
        updateListing,
        deleteListing,
        sellers,
        currentSeller,
        setCurrentSellerId,
        updateSellerSubscription,
        updateSellerStatus,
        subscriptionDiscounts,
        addSubscriptionDiscount,
        updateSubscriptionDiscount,
        deleteSubscriptionDiscount,
        toggleDiscountActive,
        toggleDiscountFeatured,
        validateAndApplyPromoCode,
        users,
        updateUserStatus,
        updateUserRole,
        updateUser,
        addUser,
        deleteUser,
        bankingDetails,
        updateBankingDetails,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        favorites,
        toggleFavorite,
        orders,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        inquiries,
        createInquiry,
        filters,
        setFilters,
        resetFilters,
        selectedListing,
        setSelectedListing,
        isCompareOpen,
        setIsCompareOpen,
        isAddEditModalOpen,
        setIsAddEditModalOpen,
        isBulkUploadModalOpen,
        setIsBulkUploadModalOpen,
        editingListing,
        setEditingListing,
        isSubscriptionModalOpen,
        setIsSubscriptionModalOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isRequestPartOpen,
        setIsRequestPartOpen,
        isInstallModalOpen,
        setIsInstallModalOpen,
        isSearchEngineModalOpen,
        setIsSearchEngineModalOpen,
        isWebLinkModalOpen,
        setIsWebLinkModalOpen,
        webLinkModalData,
        setWebLinkModalData,
        openWebLinkGenerator,
        isSellerAuthModalOpen,
        setIsSellerAuthModalOpen,
        sellerAuthMode,
        setSellerAuthMode,
        openSellerAuth,
        registerNewSeller,
        loginSeller,
        loginSellerByCredentials,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        isAdminAuthenticated,
        setIsAdminAuthenticated,
        authenticateAdmin,
        logoutAdmin,
        isWhatsAppModalOpen,
        setIsWhatsAppModalOpen,
        whatsAppModalData,
        setWhatsAppModalData,
        openWhatsAppChat,
        canInstallPWA,
        triggerPWAInstall,
        detectedPlatform,
        activeNotification,
        showNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
