import { Timestamp } from "firebase/firestore";

export type UserRole = "customer" | "super_admin" | "company_admin" | "staff" | "viewer" | "driver";

// ============================================================================
// SHOWROOM/SHOWCASE CAR SCHEMA
// ============================================================================
// This interface represents a vehicle LISTED FOR SALE by a dealer/showroom.
// It replaces the rental-focused Car interface. Rental fields are kept as
// optional for legacy data; new records should ignore them.
// ============================================================================

export type ListingStatus = "available" | "reserved" | "sold" | "draft";
export type BodyType = "SUV" | "Sedan" | "Hatchback" | "Coupe" | "Convertible" | "Wagon" | "Van" | "Pickup" | "Minibus" | "Luxury" | "Bus" | "Truck";
export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid" | "Plug-in Hybrid";
export type Transmission = "Automatic" | "Manual" | "CVT" | "Semi-Automatic";
export type Drivetrain = "FWD" | "RWD" | "AWD" | "4WD";
export type ConditionGrade = "Brand New" | "Foreign Used" | "Locally Used" | "Certified Pre-Owned";
export type Currency = "TZS" | "USD";

export interface Showroom {
  id: string;
  name: string;              // e.g. "XYZ Motors"
  slug: string;              // e.g. "xyz-motors"
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  bannerUrl?: string;
  location?: string;
  city: string;
  address?: string;
  phone: string;             // WhatsApp-preferred
  email?: string;
  whatsapp?: string;
  website?: string;
  verified: boolean;         // Admin-verified dealer
  rating: number;            // Aggregate rating 0-5
  reviewsCount?: number;
  activeListingsCount?: number;
  totalListings?: number;
  yearsInBusiness?: number;
  establishedYear?: number;
  openingHours?: string;
  specialties?: string[];    // e.g. ["Japanese imports", "Luxury"]
  createdAt: any;
  updatedAt: any;
}

export interface Car {
  // ====== Core Identity ======
  id: string;
  make: string;
  model: string;
  variant?: string;          // e.g. "TX", "GLE 450", "Limited"
  year: number;
  vin?: string;              // Chassis number
  plateNumber?: string;      // Optional for fresh imports
  
  // ====== Classification ======
  category: BodyType;        // "SUV" | "Sedan" | ...
  condition: ConditionGrade; // "Brand New" | "Foreign Used" | ...
  bodyType?: BodyType;       // Alias, kept for back-compat
  
  // ====== Visual ======
  color: string;             // Exterior color
  interiorColor?: string;
  images: string[];          // Up to N images; first = hero
  coverImage?: string;       // Explicit cover (else images[0])
  
  // ====== Specs ======
  seats: number;
  doors?: number;
  transmission: Transmission;
  fuelType: FuelType;
  drivetrain?: Drivetrain;
  engineSize?: string;       // e.g. "2.0L Turbo", "3000cc"
  horsepower?: number;
  mileage: number;           // In km
  mileageUnit?: "km" | "miles";
  
  // ====== Pricing & Cost (Showroom Management) ======
  price: number;             // Asking price (numeric)
  costPrice?: number;        // Purchase / Auction / Import cost
  importDutyCost?: number;   // Customs duty / TRA taxes
  repairCost?: number;       // Refurbishment & servicing cost
  currency: Currency;        // "TZS" | "USD"
  negotiable: boolean;       // "Price on request" or "Negotiable"
  discountPrice?: number;    // Optional marked-down price
  financeAvailable: boolean; // Dealer offers financing
  monthlyEstimate?: number;  // Optional pre-computed monthly payment
  dutyStatus?: "Cleared" | "In-Bond" | "Exempt" | "Pending Tax";
  
  // ====== Availability / Status ======
  status: ListingStatus;     // "available" | "reserved" | "sold" | "draft"
  available: boolean;        // Back-compat alias (status === "available")
  soldAt?: Timestamp | string | any;
  soldPrice?: number;        // Actual final sale price when marked as sold
  
  // ====== Location & Showroom ======
  location: string;          // City: "Dar es Salaam" | "Arusha" | ...
  showroomId: string;        // FK to Showroom
  showroomName: string;      // Denormalized for fast reads
  showroomPhone?: string;    // Denormalized WhatsApp contact
  
  // ====== Description / Marketing ======
  features: string[];        // ["Sunroof", "Leather", "360 Camera"]
  description: string;
  highlights?: string[];     // Bullet points shown in spec sheet
  
  // ====== Provenance / History ======
  previousOwners?: number;   // 0 for brand new
  accidentHistory?: "None" | "Minor" | "Major" | "Unknown";
  serviceHistory?: boolean;  // Full service history available
  importCountry?: string;    // e.g. "Japan", "UAE", "UK"
  warrantyMonths?: number;   // Remaining warranty
  hasDriver?: boolean;       // Chauffeur/driver option available
  driverFeePerDay?: number | null; // Driver fee if hasDriver is true
  testDriveAvailable?: boolean; // Test drive eligible
  registrationStatus?: string; // e.g. "Registered TZ", "Imported Duty Free"
  
  // ====== Engagement ======
  views: number;             // Page views
  inquiries: number;         // Total inquiry count
  rating: number;            // 0-5 average rating
  reviewsCount: number;
  featured: boolean;         // Show on homepage hero
  
  // ====== Admin / Audit ======
  addedBy: string;
  addedByName?: string;
  companyId?: string;        // Legacy (kept for back-compat)
  
  // ====== Legacy Rental Fields (optional, deprecated) ======
  pricePerDay?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  withDriverCostPerDay?: number;
  insuranceValid?: boolean;
  insuranceExpiry?: string;
  totalRentals?: number;
  classTier?: string;
  capacityTier?: string;
  occupancyRate?: number;
  pricingRecommendation?: {
    suggestedPrice: number;
    reason: string;
    trend: 'up' | 'down' | 'stable';
  };
  
  // ====== Timestamps ======
  createdAt: Timestamp | string | any;
  updatedAt: Timestamp | string | any;
  publishedAt?: Timestamp | string | any;
}

// ============================================================================
// SALES TRANSACTION (Financial Ledger)
// ============================================================================
// Records a vehicle sale, buyer details, and profit calculation.
// ============================================================================

export interface SalesTransaction {
  id: string;
  carId: string;
  carName: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  showroomId: string;
  showroomName: string;
  
  // Buyer Details
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  buyerNIN?: string;         // National ID / Passport
  buyerCity?: string;
  
  // Financial Breakdown
  salePrice: number;         // Agreed final selling price
  costPrice: number;        // Initial vehicle purchase / import cost
  importDutyCost?: number;   // Duty / tax paid
  repairCost?: number;       // Refurbishment & service cost
  otherExpenses?: number;    // Misc transaction costs (commissions, transfer)
  grossProfit: number;       // salePrice - costPrice
  netProfit: number;         // salePrice - (costPrice + importDutyCost + repairCost + otherExpenses)
  
  currency: Currency;
  paymentStatus: "paid" | "installment" | "deposit_only";
  amountPaid: number;
  balanceDue: number;
  paymentMethod: "Bank Transfer" | "Cash" | "Lipa kwa M-Pesa" | "TigoPesa" | "Cheque";
  
  salesRepId?: string;
  salesRepName?: string;
  notes?: string;
  
  saleDate: Timestamp | string | any;
  createdAt: Timestamp | string | any;
}

// ============================================================================
// SHOWROOM EXPENSE TRACKER
// ============================================================================
// Tracks showroom operational overhead and car-specific costs.
// ============================================================================

export type ExpenseCategory = 
  | "vehicle_refurbishment" 
  | "import_duty" 
  | "showroom_rent" 
  | "salaries" 
  | "marketing" 
  | "utilities" 
  | "maintenance" 
  | "licenses_permits"
  | "other";

export interface ShowroomExpense {
  id: string;
  showroomId: string;
  title: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  carId?: string;            // Linked vehicle if specific to a car
  carName?: string;
  date: string;              // YYYY-MM-DD
  recordedBy: string;
  recordedByName?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: Timestamp | string | any;
}

// ============================================================================
// INQUIRY (replaces Booking)
// ============================================================================
// A lead / inquiry from a prospective buyer to a dealer about a specific car.
// ============================================================================

export interface Inquiry {
  id: string;
  carId: string;
  carName: string;
  carPrice: number;
  carCurrency: Currency;
  
  showroomId: string;
  showroomName: string;
  showroomPhone: string;
  
  // Buyer
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  buyerCity?: string;
  
  // Message
  message: string;
  preferredContactTime?: string;
  wantsFinancing?: boolean;
  wantsTestDrive?: boolean;
  offeredPrice?: number;     // Optional "Make Offer"
  
  // Lead management
  status: "new" | "contacted" | "negotiating" | "scheduled" | "closed_won" | "closed_lost";
  source: "web" | "whatsapp" | "phone" | "walk_in" | "referral";
  assignedTo?: string;
  
  notes?: { text: string; addedBy: string; addedByName: string; createdAt: string }[];
  
  createdAt: Timestamp | string | any;
  updatedAt: Timestamp | string | any;
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  vehicleCategory: string;
  pricePerDay: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  amountPaid: number;
  balanceDue: number;
  withDriver: boolean;
  driverCost: number;
  driverName?: string;
  driverEmail?: string;
  tripPurpose?: string;
  location: string;
  pickupLocation: string;
  pickupTime?: string;
  specialRequirements?: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";
  currency: "TZS";
  companyId: string;
  companyName: string;
  reminder48Sent: boolean;
  reminder24Sent: boolean;
  aiEmailSent: boolean;
  // Loyalty & Redemption
  pointsRedeemed?: number;
  discountApplied?: number;
  // Intelligence Node Fields
  aiPersonalityTag?: "luxury" | "corporate" | "adventure" | "standard";
  geminiInsight?: string;
  riskStatus?: "low" | "medium" | "high";
  riskReason?: string;
  rebookingAttemptedAt?: string;
  contractUrl?: string;
  hasReview?: boolean;
  notes?: { text: string; addedBy: string; addedByName: string; createdAt: string }[];
  createdAt: Timestamp | string | any;
  updatedAt: Timestamp | string | any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  role: UserRole;
  companyId?: string;
  verified?: boolean;
  voltaPoints?: number;
  totalSpent?: number;
  city?: string;
  adminNotes?: { text: string; addedBy: string; addedByName: string; createdAt: string }[];
  createdAt: any;
  updatedAt: any;
}

export interface Branding {
  companyName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl?: string;
  themeColor?: string;
  showSplash?: boolean;
  enableSounds?: boolean;
  heroImageUrl: string;
  heroVideoUrl: string;
  suvImageUrl: string;
  sedanImageUrl: string;
  vanImageUrl: string;
  luxuryImageUrl: string;
  aboutImageUrl?: string;
  precisionImageUrl?: string;
  experienceMediaUrl: string;
  experienceMediaType: "image" | "video";
  activeTheme: string;
  activeFont?: string;
  whatsappNumber: string;
  supportEmail: string;
  officeAddress: string;
  lipaNamba?: string;
  n8nWebhookUrl?: string;
  aiKeys?: string[];
  stats?: {
    deployed: number;
    missions: number;
    satisfaction: number;
    cities: number;
  };
  marqueeItems?: { label: string; tag: string; plate: string }[];
  updatedAt: any;
  updatedBy: string;
}

export interface Review {
  id: string;
  bookingId: string;
  bookingCode: string;
  carId: string;
  carName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  tags?: string[];
  helpful?: number;
  helpfulVoters?: string[];
  adminReply?: string | null;
  adminReplyAt?: any;
  status?: "published" | "pending" | "hidden" | string;
  createdAt: any;
  updatedAt: any;
}

export interface Payment {
  id?: string;
  bookingId: string;
  orderTrackingId?: string;
  confirmationCode?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  autoVerified?: boolean;
  source: string;
  verifiedAt?: any;
  createdAt: any;
}
