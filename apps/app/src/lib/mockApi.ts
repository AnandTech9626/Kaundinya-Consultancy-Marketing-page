import type {
  AppNotification,
  CreditHealth,
  DocumentRecord,
  EmiResult,
  GstinInfo,
  Hospital,
  InsuranceEstimate,
  InsuranceNeedsProfile,
  InsurancePlan,
  InsuranceType,
  InteriorConsultation,
  JobRecord,
  LoanApplication,
  LoanEligibility,
  MeasurementBooking,
  PolicyRecord,
  PrintJob,
  PropertyListing,
  ServiceRequest,
  SiteVisit,
  User,
  ValuationRequest,
  VehicleInfo,
  VehicleQuote,
} from "@kaundinya/config";
import { ApiError, api } from "./api";

/**
 * Data layer for the client app.
 *
 * Every function here talks to the live Hono API (see docs/api-contract.md).
 * The exported names/signatures are unchanged from the previous mock layer so
 * screens stay untouched.
 */

const NOT_FOUND = 404;
const UNPROCESSABLE = 422;

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === NOT_FOUND;
}

/* ------------------------------- Mappers -------------------------------- */

const PROPERTY_TYPES: PropertyListing["propertyType"][] = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
];

function toProperty(raw: PropertyListing): PropertyListing {
  const propertyType = PROPERTY_TYPES.includes(raw.propertyType)
    ? raw.propertyType
    : "Apartment";
  return {
    ...raw,
    propertyType,
    amenities: raw.amenities ?? [],
    images: raw.images ?? [],
  };
}

type RawInsurancePlan = Omit<InsurancePlan, "cashlessNetwork"> & {
  cashlessNetwork?: number | boolean;
};

function toInsurancePlan(raw: RawInsurancePlan): InsurancePlan {
  const { cashlessNetwork, ...rest } = raw;
  return {
    ...rest,
    cashlessNetwork: typeof cashlessNetwork === "number" ? cashlessNetwork : undefined,
  };
}

type RawVehicleQuote = Omit<VehicleQuote, "plan"> & { plan: RawInsurancePlan };

function toVehicleQuote(raw: RawVehicleQuote): VehicleQuote {
  return { ...raw, plan: toInsurancePlan(raw.plan) };
}

function toJob(raw: JobRecord): JobRecord {
  return {
    ...raw,
    technician: raw.technician ?? null,
    technicianPhone: raw.technicianPhone ?? null,
    scheduledAt: raw.scheduledAt ?? null,
    startOtp: raw.startOtp ?? null,
    rating: raw.rating ?? null,
    issueTypes: raw.issueTypes ?? [],
  };
}

function toPrintJob(raw: PrintJob): PrintJob {
  return { ...raw, autoDeletedAt: raw.autoDeletedAt || isoInDays(1) };
}

function isoInDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/* --------------------------------- Requests ------------------------------ */

export interface CreateRequestInput {
  serviceCategory: string;
  specificService: string;
  comments?: string;
  loanRequirementId?: string;
  loanBank?: string;
  requirementSource?: "salaried" | "business";
  requirementMonthlyIncome?: number;
  requirementMonthlyEmis?: number;
}

export function fetchRequests(): Promise<ServiceRequest[]> {
  return api.get<ServiceRequest[]>("/requests");
}

export async function fetchRequest(id: string): Promise<ServiceRequest | null> {
  try {
    return await api.get<ServiceRequest>(`/requests/${id}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export function createRequest(input: CreateRequestInput): Promise<ServiceRequest> {
  return api.post<ServiceRequest>("/requests", input);
}

/* ------------------------------- Notifications -------------------------- */

export function fetchNotifications(): Promise<AppNotification[]> {
  return api.get<AppNotification[]>("/notifications");
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch<AppNotification>(`/notifications/${id}/read`);
}

export function markAllNotificationsRead(): Promise<AppNotification[]> {
  return api.post<AppNotification[]>("/notifications/read-all");
}

/* --------------------------- Real Estate (Module 1) --------------------------- */

export interface PropertyFilters {
  listingType?: "rent" | "sale" | "all";
  bhk?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}

function propertyQuery(filters: PropertyFilters) {
  const query: Record<string, string | number> = {};
  if (filters.listingType && filters.listingType !== "all") {
    query.listingType = filters.listingType;
  }
  if (filters.bhk) query.bhk = filters.bhk;
  if (filters.location) query.location = filters.location;
  if (filters.minPrice) query.minPrice = filters.minPrice;
  if (filters.maxPrice) query.maxPrice = filters.maxPrice;
  return query;
}

async function fetchPropertyList(
  path: string,
  filters: PropertyFilters = {},
): Promise<PropertyListing[]> {
  const list = await api.get<PropertyListing[]>(path, {
    query: propertyQuery(filters),
  });
  return list.map(toProperty);
}

export function fetchProperties(
  filters: PropertyFilters = {},
): Promise<PropertyListing[]> {
  return fetchPropertyList("/properties", filters);
}

export function fetchBuyProperties(
  filters: PropertyFilters = {},
): Promise<PropertyListing[]> {
  return fetchPropertyList("/properties/buy", filters);
}

export function fetchRentProperties(
  filters: PropertyFilters = {},
): Promise<PropertyListing[]> {
  return fetchPropertyList("/properties/rent", filters);
}

export function fetchSaleProperties(
  filters: PropertyFilters = {},
): Promise<PropertyListing[]> {
  return fetchPropertyList("/properties/sale", filters);
}

export function fetchMyProperties(): Promise<PropertyListing[]> {
  return api.get<PropertyListing[]>("/properties/mine").then((list) => list.map(toProperty));
}

export async function fetchProperty(id: string): Promise<PropertyListing | null> {
  try {
    return toProperty(await api.get<PropertyListing>(`/properties/${id}`));
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export function fetchSiteVisits(): Promise<SiteVisit[]> {
  return api.get<SiteVisit[]>("/site-visits");
}

export interface BookSiteVisitInput {
  propertyId: string;
  date: string;
  slot: string;
  notes?: string;
  clientName?: string;
  mobile?: string;
}

export async function bookSiteVisit(input: BookSiteVisitInput): Promise<SiteVisit> {
  let propertyTitle = "Property visit";
  try {
    const property = await fetchProperty(input.propertyId);
    if (property?.title) propertyTitle = property.title;
  } catch {
    // Keep the default title if the property lookup fails.
  }

  return api.post<SiteVisit>("/site-visits", {
    propertyId: input.propertyId,
    propertyTitle,
    date: input.date,
    slot: input.slot,
    notes: input.notes,
    clientName: input.clientName,
  });
}

export interface SubmitListingInput {
  title: string;
  description: string;
  listingType: "rent" | "sale";
  propertyType: PropertyListing["propertyType"];
  bhk: string;
  location: string;
  pincode: string;
  price: number;
  areaSqft: number;
  furnishing?: string;
  amenities: string[];
  images?: string[];
  files?: File[];
}

export async function submitListing(input: SubmitListingInput): Promise<PropertyListing> {
  const { files, ...payload } = input;
  const path =
    payload.listingType === "rent" ? "/properties/rent-out" : "/properties/sell";
  const created = await api.post<PropertyListing>(path, {
    ...payload,
    images: input.images ?? [],
  });

  let property = toProperty(created);

  if (files && files.length > 0) {
    const form = new FormData();
    for (const file of files) {
      form.append("photos", file);
    }
    const assets = await api.postForm<Array<{ url: string }>>(
      `/properties/${property.id}/photos`,
      form,
    );
    property = { ...property, images: assets.map((asset) => asset.url) };
  }

  return property;
}

export function fetchValuations(): Promise<ValuationRequest[]> {
  return api.get<ValuationRequest[]>("/valuations");
}

export interface BookValuationInput {
  ownerName: string;
  mobile: string;
  propertyType: string;
  location: string;
  pincode: string;
  expectedPrice?: number;
  notes?: string;
}

export function bookValuation(input: BookValuationInput): Promise<ValuationRequest> {
  return api.post<ValuationRequest>("/valuations", {
    ownerName: input.ownerName,
    mobile: input.mobile,
    propertyType: input.propertyType,
    location: input.location,
    pincode: input.pincode,
    expectedPrice: input.expectedPrice,
    notes: input.notes,
  });
}

/* ------------------------------- Insurance ------------------------------- */

export async function fetchInsurancePlans(
  filters: { type?: InsuranceType; familyOption?: string } = {}
): Promise<InsurancePlan[]> {
  const query: Record<string, string> = {};
  if (filters.type) query.type = filters.type;
  if (filters.familyOption) query.familyOption = filters.familyOption;

  const plans = await api.get<RawInsurancePlan[]>("/insurance/plans", { query });
  return plans.map(toInsurancePlan);
}

export function estimateInsuranceNeeds(
  profile: InsuranceNeedsProfile
): Promise<InsuranceEstimate> {
  return api.post<InsuranceEstimate>("/insurance/needs-analysis", {
    annualIncome: profile.annualIncome,
    dependents: profile.dependents,
    liabilities: profile.liabilities,
  });
}

export async function fetchHospitals(pincode?: string): Promise<Hospital[]> {
  return api.get<Hospital[]>("/insurance/network-hospitals", {
    query: pincode ? { pincode } : undefined,
  });
}

export async function lookupVehicle(
  registrationNumber: string
): Promise<VehicleInfo | null> {
  try {
    return await api.post<VehicleInfo>("/insurance/motor/vehicle-lookup", {
      registrationNumber,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === UNPROCESSABLE) return null;
    throw error;
  }
}

export async function getMotorQuote(vehicle: VehicleInfo): Promise<VehicleQuote> {
  return toVehicleQuote(await api.post<RawVehicleQuote>("/insurance/motor/quote", { vehicle }));
}

export function purchaseMotorPolicy(
  planId: string,
  vehicle: VehicleInfo,
  addOns: string[] = []
): Promise<PolicyRecord> {
  return api.post<PolicyRecord>("/insurance/motor/checkout", {
    planId,
    vehicle,
    addOns,
  });
}

export function fetchPolicies(): Promise<PolicyRecord[]> {
  return api.get<PolicyRecord[]>("/policies");
}

export function downloadPolicy(id: string): Promise<{ fileName: string }> {
  return api.get<{ fileName: string }>(`/policies/${id}/download`);
}

/* ----------------------------- Home services ----------------------------- */

export function fetchMeasurements(): Promise<MeasurementBooking[]> {
  return api.get<MeasurementBooking[]>("/home-services/measurements");
}

export interface BookMeasurementInput {
  serviceId: string;
  serviceName: string;
  address: string;
  pincode: string;
  date: string;
  slot: string;
  notes?: string;
}

export function bookMeasurement(
  input: BookMeasurementInput
): Promise<MeasurementBooking> {
  return api.post<MeasurementBooking>("/home-services/measurements", {
    ...input,
    notes: input.notes,
  });
}

export async function fetchJobs(): Promise<JobRecord[]> {
  const jobs = await api.get<JobRecord[]>("/jobs");
  return jobs.map(toJob);
}

export async function fetchJob(id: string): Promise<JobRecord | null> {
  try {
    return toJob(await api.get<JobRecord>(`/jobs/${id}`));
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export interface CreateJobInput {
  serviceId: string;
  serviceName: string;
  issueTypes: string[];
  address: string;
  pincode?: string;
  date?: string;
  slot?: string;
  amount?: number;
  notes?: string;
}

export async function createJob(input: CreateJobInput): Promise<JobRecord> {
  const created = await api.post<JobRecord>("/home-services/jobs", {
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    issueTypes: input.issueTypes,
    address: input.address,
    pincode: input.pincode,
    date: input.date,
    slot: input.slot,
    amount: input.amount,
    notes: input.notes,
  });
  return toJob(created);
}

export function requestJobStartOtp(
  jobId: string
): Promise<{ otp: string; expiresInSeconds: number }> {
  return api.post<{ otp: string; expiresInSeconds: number }>(
    `/jobs/${jobId}/start-otp`
  );
}

export async function rateJob(
  jobId: string,
  stars: number,
  comment?: string
): Promise<JobRecord | null> {
  try {
    return toJob(await api.post<JobRecord>(`/jobs/${jobId}/rating`, { stars, comment }));
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export function fetchDocuments(): Promise<DocumentRecord[]> {
  return api.get<DocumentRecord[]>("/digital-services/documents");
}

export interface UploadDocumentInput {
  docType: string;
  file: File;
}

export function uploadDocument(input: UploadDocumentInput): Promise<DocumentRecord> {
  const form = new FormData();
  form.append("docType", input.docType);
  form.append("file", input.file);
  return api.postForm<DocumentRecord>("/digital-services/documents", form);
}

export async function fetchPrintJobs(): Promise<PrintJob[]> {
  const jobs = await api.get<PrintJob[]>("/digital-services/printouts");
  return jobs.map(toPrintJob);
}

export interface CreatePrintJobInput {
  file: File;
  copies: number;
  pages: number;
  paperSize: NonNullable<PrintJob["paperSize"]>;
  colorMode: NonNullable<PrintJob["colorMode"]>;
  sides: NonNullable<PrintJob["sides"]>;
  binding: NonNullable<PrintJob["binding"]>;
}

export async function createPrintJob(input: CreatePrintJobInput): Promise<PrintJob> {
  const form = new FormData();
  form.append("file", input.file);
  form.append("pages", String(input.pages));
  form.append("copies", String(input.copies));
  form.append("paperSize", input.paperSize);
  form.append("colorMode", input.colorMode);
  form.append("sides", input.sides);
  form.append("binding", input.binding);
  return toPrintJob(
    await api.postForm<PrintJob>("/digital-services/printouts", form),
  );
}

export function fetchInteriorConsultations(): Promise<InteriorConsultation[]> {
  return api.get<InteriorConsultation[]>("/interiors/consultations");
}

export interface CreateInteriorConsultationInput {
  name: string;
  mobile: string;
  style: string;
  budget: string;
  notes?: string;
}

export function createInteriorConsultation(
  input: CreateInteriorConsultationInput
): Promise<InteriorConsultation> {
  return api.post<InteriorConsultation>("/interiors/consultations", {
    name: input.name,
    mobile: input.mobile,
    style: input.style,
    budget: input.budget,
    notes: input.notes,
  });
}

/* --------------------------------- Loans --------------------------------- */

export function calculateEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number
): Promise<EmiResult> {
  return api.post<EmiResult>("/loans/emi/calculate", {
    principal,
    annualRate,
    tenureMonths,
  });
}

export function estimateLoanEligibility(
  monthlyIncome: number,
  obligations: number,
  _age: number,
  _employmentType: "salaried" | "self-employed"
): Promise<LoanEligibility> {
  return api.post<LoanEligibility>("/loans/eligibility", {
    monthlyIncome,
    obligations,
  });
}

export type LoanIncomeSource = "salaried" | "business";

export interface LoanPlanSummary {
  id: string;
  bank: string;
  product: string;
  loanType: "Home" | "Personal" | "Business" | "Mortgage";
  employmentTypes: LoanIncomeSource[];
  minMonthlyIncome: number;
  annualRate: number;
  maxTenureMonths: number;
  minAmount: number;
  maxAmount: number;
  active: boolean;
}

/** Admin-maintained plans that are currently live for clients. */
export function fetchActiveLoanPlans(): Promise<LoanPlanSummary[]> {
  return api.get<LoanPlanSummary[]>("/loans/plans");
}


/** The three requirement fields the client collects. Nothing more. */
export interface LoanRequirementInput {
  sourceOfIncome: LoanIncomeSource;
  monthlyIncome: number;
  monthlyEmis: number;
}

export interface RecommendedLoanPlan {
  id: string;
  bank: string;
  product: string;
  loanType: "Home" | "Personal" | "Business" | "Mortgage";
  employmentTypes: LoanIncomeSource[];
  minMonthlyIncome: number;
  annualRate: number;
  maxTenureMonths: number;
  minAmount: number;
  maxAmount: number;
  active: boolean;
  eligibleAmount: number;
  emi: number;
}

export interface LoanRecommendationResult {
  id: string;
  eligibleAmount: number;
  indicativeEmi: number;
  rateBasis: string;
  capacity: number;
  plans: RecommendedLoanPlan[];
}

/**
 * Matches the client's three requirement fields against the bank plans an
 * admin has added and kept live. Every call is stored as a requirement the
 * admin can review and export.
 */
export function recommendLoanPlans(
  input: LoanRequirementInput
): Promise<LoanRecommendationResult> {
  return api.post<LoanRecommendationResult>("/loans/recommend", input);
}

export function fetchLoanApplications(): Promise<LoanApplication[]> {
  return api.get<LoanApplication[]>("/loans/applications");
}

export async function fetchLoanApplication(
  id: string
): Promise<LoanApplication | null> {
  try {
    return await api.get<LoanApplication>(`/loans/applications/${id}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export interface SubmitLoanApplicationInput {
  loanType: LoanApplication["loanType"];
  amount: number;
  tenureMonths: number;
  monthlyIncome: number;
  employmentType: "salaried" | "self-employed";
  purpose: string;
  documents: string[];
  propertyId?: string;
}

export function submitLoanApplication(
  input: SubmitLoanApplicationInput
): Promise<LoanApplication> {
  return api.post<LoanApplication>("/loans/applications", input);
}

export function checkCreditHealth(): Promise<CreditHealth> {
  return api.post<CreditHealth>("/loans/credit-check");
}

export async function lookupGstin(gstin: string): Promise<GstinInfo | null> {
  const normalized = gstin.replace(/\s/g, "");
  if (normalized.length !== 15) return null;

  try {
    return await api.post<GstinInfo>("/loans/business/gstin-lookup", {
      gstin: normalized,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === UNPROCESSABLE) return null;
    throw error;
  }
}

/* --------------------------------- Auth --------------------------------- */

export interface OtpVerifyResult {
  token: string;
  user: User;
}

export function otpSend(mobile: string): Promise<{ expiresInSeconds: number }> {
  return api.post<{ expiresInSeconds: number }>("/otp/send", { mobile });
}

export function otpVerify(mobile: string, otp: string): Promise<OtpVerifyResult> {
  return api.post<OtpVerifyResult>("/otp/verify", { mobile, otp });
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  pinCode?: string;
}

export function updateProfile(input: UpdateProfileInput): Promise<User> {
  return api.patch<User>("/me", input);
}

export interface LoginMethod {
  exists: boolean;
  hasPin: boolean;
  profileComplete: boolean;
}

export function checkLoginMethod(mobile: string): Promise<LoginMethod> {
  return api.post<LoginMethod>("/auth/login-method", { mobile });
}

export function pinLogin(
  mobile: string,
  pin: string
): Promise<OtpVerifyResult> {
  return api.post<OtpVerifyResult>("/auth/pin/login", { mobile, pin });
}

export function setPin(pin: string, currentPin?: string): Promise<User> {
  return api.post<User>("/auth/pin/set", { pin, currentPin });
}

export function changePin(currentPin: string, newPin: string): Promise<User> {
  return api.post<User>("/auth/pin/change", { currentPin, newPin });
}

/* --------------------------- Unified requests --------------------------- */

export interface MyRequestItem {
  id: string;
  reference: string;
  title: string;
  module:
    | "Real Estate"
    | "Home Services"
    | "Digital Services"
    | "Insurance"
    | "Loans";
  status: string;
  statusLabel: string;
  createdAt: string;
  href: string;
}

export interface MyRequestsPage {
  items: MyRequestItem[];
  total: number;
  page: number;
  limit: number;
}

export function fetchMyRequests(
  params: {
    module?: string;
    status?: string;
    q?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<MyRequestsPage> {
  return api.get<MyRequestsPage>("/my/requests", { query: params });
}
