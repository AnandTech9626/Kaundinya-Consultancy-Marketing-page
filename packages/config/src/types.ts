export type ServiceCategoryId =
  | "real-estate"
  | "insurance"
  | "property-home-services"
  | "loans";

export type RequestStatus = "new" | "in_progress" | "completed" | "cancelled";

export interface User {
  name: string;
  email: string;
  mobile: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  services: string[];
  href?: string;
  image?: string;
  icon: string;
}

export interface ServiceRequest {
  id: string;
  serviceCategory: string;
  specificService: string;
  status: RequestStatus;
  createdAt: string;
  comments: string;
}

export type NotificationKind =
  | "request"
  | "job"
  | "loan"
  | "renewal"
  | "policy"
  | "site_visit"
  | "system";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  kind?: NotificationKind;
  href?: string;
}

/* ----------------------------- Admin panel ----------------------------- */

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

export type Priority = "low" | "medium" | "high";

export type StaffRole = "admin" | "agent";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
}

export interface EnquiryNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  serviceCategory: string;
  specificService: string;
  pinCode: string;
  comments: string;
  consent: boolean;
  status: EnquiryStatus;
  priority: Priority;
  assignedTo: string | null;
  followUpAt: string | null;
  source: string;
  createdAt: string;
  notes: EnquiryNote[];
}

export interface ClientRecord extends User {
  id: string;
  joinedAt: string;
  requestsCount: number;
  verified: boolean;
}

/* ------------------------- Catalog & module core ------------------------ */

export type ModuleId = ServiceCategoryId;

export type PricingModel = "fixed" | "per-sqft" | "from" | "quote";

export interface ServiceTier {
  id: string;
  label: string;
  description?: string;
  priceHint?: string;
}

export interface ServicePricing {
  model: PricingModel;
  amount?: number;
  unit?: string;
  note?: string;
}

export interface ServiceCatalogItem {
  id: string;
  categoryId: ServiceCategoryId;
  name: string;
  summary: string;
  pricing?: ServicePricing;
  tiers?: ServiceTier[];
  issueTypes?: string[];
  documents?: string[];
  highlights?: string[];
}

export interface ModuleStage {
  id: string;
  label: string;
  description?: string;
}

/** Common request envelope shared by every module. */
export interface RequestEnvelope<TDetails = Record<string, unknown>> {
  id: string;
  module: ServiceCategoryId;
  serviceId: string;
  title: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  details: TDetails;
}

export interface RealEstateDetails {
  intent: "rent" | "buy" | "sell" | "list" | "valuation";
  propertyType: string;
  locality: string;
  pincode: string;
  budget?: number;
  bhk?: string;
  notes?: string;
}

export interface InsuranceDetails {
  insuranceType: "life" | "health" | "motor" | "property";
  age?: number;
  coverAmount?: number;
  members?: number;
  vehicleNumber?: string;
  notes?: string;
}

export interface HomeServiceDetails {
  serviceId: string;
  issueTypes: string[];
  areaSqft?: number;
  preferredDate?: string;
  address?: string;
  notes?: string;
}

export interface LoanDetails {
  loanType: "home" | "personal" | "business" | "mortgage";
  amount: number;
  tenureMonths: number;
  employmentType?: "salaried" | "self-employed";
  monthlyIncome?: number;
  notes?: string;
}

/* --------------------------- Module 1 records --------------------------- */

export interface PropertyListing {
  id: string;
  title: string;
  description: string;
  listingType: "rent" | "sale";
  propertyType: "Apartment" | "Villa" | "Independent House" | "Plot" | "Commercial";
  bhk: string;
  location: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  price: number;
  priceUnit: "month" | "total";
  areaSqft: number;
  furnishing?: string;
  amenities: string[];
  images?: string[];
  reraAgentNumber?: string;
  status: "draft" | "active" | "sold" | "rented";
  featured?: boolean;
  createdAt: string;
}

export type SiteVisitStatus = "requested" | "confirmed" | "completed" | "cancelled";

export interface SiteVisit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  mobile: string;
  date: string;
  slot: string;
  status: SiteVisitStatus;
  notes?: string;
  createdAt: string;
}

export type ValuationStatus = "requested" | "scheduled" | "completed";

export interface ValuationRequest {
  id: string;
  ownerName: string;
  mobile: string;
  propertyType: string;
  location: string;
  pincode: string;
  expectedPrice?: number;
  notes?: string;
  status: ValuationStatus;
  createdAt: string;
}

/* ------------------------------- Insurance ------------------------------ */

export type InsuranceType = "life" | "health" | "motor" | "property";

export interface InsurancePlan {
  id: string;
  type: InsuranceType;
  insurer: string;
  name: string;
  sumInsured: number;
  premium: number;
  tenureYears: number;
  features: string[];
  cashlessNetwork?: number;
  pospLicense?: string;
  familyOption?: "self" | "couple" | "parents" | "family";
}

export interface InsuranceNeedsProfile {
  type: InsuranceType;
  age: number;
  annualIncome: number;
  dependents: number;
  smoker: boolean;
  liabilities: number;
}

export interface InsuranceEstimate {
  recommendedCoverage: number;
  estimatedPremium: number;
  basis: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  pincode: string;
  cashless: boolean;
  distanceKm?: number;
}

export interface VehicleInfo {
  registrationNumber: string;
  make: string;
  model: string;
  fuelType: string;
  year: number;
  engineCC: number;
}

export interface VehicleQuote {
  plan: InsurancePlan;
  vehicle: VehicleInfo;
  addOns: string[];
  totalPremium: number;
}

export interface PolicyRecord {
  id: string;
  type: "Life & Term" | "Health" | "Motor" | "Property";
  provider: string;
  policyNumber: string;
  coverAmount: number;
  premium: number;
  renewalDate: string;
  status: "active" | "expiring" | "lapsed";
  holder?: string;
  validFrom?: string;
  pdfUrl?: string;
}

/* ---------------------------- Home services ----------------------------- */

export interface MeasurementBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  address: string;
  pincode: string;
  date: string;
  slot: string;
  status: "requested" | "scheduled" | "completed";
  createdAt: string;
}

export interface JobRecord {
  id: string;
  serviceId?: string;
  serviceName: string;
  status: string;
  technician: string | null;
  technicianPhone?: string | null;
  scheduledAt: string | null;
  startOtp: string | null;
  rating: number | null;
  ratingComment?: string;
  address?: string;
  issueTypes?: string[];
  amount?: number;
  createdAt?: string;
}

export interface DocumentRecord {
  id: string;
  docType: string;
  fileName: string;
  watermark: string;
  createdAt: string;
}

export interface PrintJob {
  id: string;
  fileName: string;
  copies: number;
  price: number;
  status: "queued" | "printing" | "completed";
  autoDeletedAt: string;
  createdAt: string;
}

export interface InteriorConsultation {
  id: string;
  name: string;
  mobile: string;
  style: string;
  budget: string;
  notes?: string;
  status: "requested" | "contacted";
  createdAt: string;
}

/* --------------------------------- Loans -------------------------------- */

export interface LoanApplication {
  id: string;
  loanType: "Home" | "Personal" | "Business" | "Mortgage";
  amount: number;
  status: string;
  bank: string | null;
  createdAt: string;
  monthlyIncome?: number;
  tenureMonths?: number;
  employmentType?: "salaried" | "self-employed";
  purpose?: string;
  documents?: string[];
  advisor?: string | null;
  propertyId?: string;
}

export interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayable: number;
}

export interface LoanEligibility {
  eligibleAmount: number;
  maxTenureMonths: number;
  estimatedEmi: number;
  note: string;
}

export interface CreditHealth {
  scoreBand: "excellent" | "good" | "fair" | "needs_work";
  eligibleProducts: string[];
  note: string;
}

export interface GstinInfo {
  gstin: string;
  legalName: string;
  address: string;
  turnover: string;
}
