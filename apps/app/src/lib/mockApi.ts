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
import { MODULE_STAGES } from "@kaundinya/config";
import { MOCK_NOTIFICATIONS, MOCK_REQUESTS } from "./mockData";
import { formatDate } from "./formats";
import {
  DOCUMENTS,
  HOSPITALS,
  INSURANCE_PLANS,
  INTERIOR_CONSULTATIONS,
  JOBS,
  LOANS,
  MEASUREMENTS,
  POLICIES,
  PRINT_JOBS,
  PROPERTIES,
  SITE_VISITS,
  VALUATIONS,
  VEHICLES,
} from "./moduleData";

/**
 * Mock API layer.
 *
 * Every function here mirrors the shape the real Hono API will expose (see
 * docs/api-contract.md). Pages consume these, so when the backend is ready we
 * only swap the internals of this file for `fetch(...)` calls — no page edits.
 */

const LATENCY_MS = 650;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Session-scoped in-memory stores so newly created items appear immediately.
let requestsStore: ServiceRequest[] = [...MOCK_REQUESTS];
let notificationsStore: AppNotification[] = [...MOCK_NOTIFICATIONS];

export interface CreateRequestInput {
  serviceCategory: string;
  specificService: string;
  comments?: string;
}

export function fetchRequests(): Promise<ServiceRequest[]> {
  return delay([...requestsStore]);
}

export function fetchRequest(id: string): Promise<ServiceRequest | null> {
  return delay(requestsStore.find((r) => r.id === id) ?? null);
}

export function createRequest(input: CreateRequestInput): Promise<ServiceRequest> {
  const created: ServiceRequest = {
    id: `req-${Date.now()}`,
    serviceCategory: input.serviceCategory,
    specificService: input.specificService,
    status: "new",
    createdAt: new Date().toISOString().slice(0, 10),
    comments: input.comments?.trim() ?? "",
  };
  requestsStore = [created, ...requestsStore];
  return delay(created);
}

const readNotificationIds = new Set<string>();

function moduleNotifications(): AppNotification[] {
  const items: AppNotification[] = [];

  const expiringPolicy = policiesStore.find(
    (policy) => policy.status === "expiring"
  );
  if (expiringPolicy) {
    items.push({
      id: `ntf-renewal-${expiringPolicy.id}`,
      kind: "renewal",
      title: "Policy renewal due",
      message: `${expiringPolicy.provider} ${expiringPolicy.type.toLowerCase()} policy renews on ${formatDate(expiringPolicy.renewalDate)}. Review it before it lapses.`,
      createdAt: isoToday(),
      read: false,
      href: "/insurance/policies",
    });
  }

  const activeJob = jobsStore.find((job) =>
    ["assigned", "en_route", "in_progress"].includes(job.status)
  );
  if (activeJob) {
    const stage =
      MODULE_STAGES["property-home-services"].find(
        (item) => item.id === activeJob.status
      )?.label ?? activeJob.status;
    items.push({
      id: `ntf-job-${activeJob.id}-${activeJob.status}`,
      kind: "job",
      title: `Job ${stage.toLowerCase()}`,
      message: `${activeJob.serviceName}${activeJob.technician ? ` · ${activeJob.technician}` : ""}. Open the tracker for the next step.`,
      createdAt: isoToday(),
      read: false,
      href: `/jobs/${activeJob.id}`,
    });
  }

  const approvedLoan = loansStore.find((loan) => loan.status === "approved");
  if (approvedLoan) {
    items.push({
      id: `ntf-loan-${approvedLoan.id}-${approvedLoan.status}`,
      kind: "loan",
      title: "Loan approved",
      message: `Your ${approvedLoan.loanType.toLowerCase()} loan is approved${approvedLoan.bank ? ` by ${approvedLoan.bank}` : ""}. Next step: disbursal.`,
      createdAt: isoToday(),
      read: false,
      href: `/loans/applications/${approvedLoan.id}`,
    });
  }

  const confirmedVisit = siteVisitsStore.find(
    (visit) => visit.status === "confirmed"
  );
  if (confirmedVisit) {
    items.push({
      id: `ntf-visit-${confirmedVisit.id}-${confirmedVisit.status}`,
      kind: "site_visit",
      title: "Site visit confirmed",
      message: `${confirmedVisit.propertyTitle} on ${formatDate(confirmedVisit.date)} at ${confirmedVisit.slot}.`,
      createdAt: isoToday(),
      read: false,
      href: `/real-estate/${confirmedVisit.propertyId}`,
    });
  }

  return items;
}

function allNotifications() {
  return [...moduleNotifications(), ...notificationsStore].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

function withReadState(list: AppNotification[]) {
  return list.map((notification) => ({
    ...notification,
    read: notification.read || readNotificationIds.has(notification.id),
  }));
}

export function fetchNotifications(): Promise<AppNotification[]> {
  return delay(withReadState(allNotifications()));
}

export function markNotificationRead(id: string): Promise<void> {
  readNotificationIds.add(id);
  notificationsStore = notificationsStore.map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification
  );
  return delay(undefined, 200);
}

export function markAllNotificationsRead(): Promise<AppNotification[]> {
  allNotifications().forEach((notification) =>
    readNotificationIds.add(notification.id)
  );
  notificationsStore = notificationsStore.map((n) => ({ ...n, read: true }));
  return delay(withReadState(allNotifications()));
}

/* --------------------------- Real Estate (Module 1) --------------------------- */

let propertiesStore: PropertyListing[] = [...PROPERTIES];
let siteVisitsStore: SiteVisit[] = [...SITE_VISITS];
let valuationsStore: ValuationRequest[] = [...VALUATIONS];

export interface PropertyFilters {
  listingType?: "rent" | "sale" | "all";
  bhk?: string;
  location?: string;
  maxBudget?: number;
}

export function fetchProperties(
  filters: PropertyFilters = {}
): Promise<PropertyListing[]> {
  let list = [...propertiesStore];
  if (filters.listingType && filters.listingType !== "all") {
    list = list.filter((property) => property.listingType === filters.listingType);
  }
  if (filters.bhk) {
    list = list.filter((property) => property.bhk === filters.bhk);
  }
  if (filters.location) {
    const needle = filters.location.trim().toLowerCase();
    list = list.filter(
      (property) =>
        property.location.toLowerCase().includes(needle) ||
        property.pincode.includes(needle)
    );
  }
  if (filters.maxBudget) {
    list = list.filter((property) => property.price <= filters.maxBudget!);
  }
  return delay(list);
}

export function fetchProperty(id: string): Promise<PropertyListing | null> {
  return delay(propertiesStore.find((property) => property.id === id) ?? null);
}

export function fetchSiteVisits(): Promise<SiteVisit[]> {
  return delay([...siteVisitsStore]);
}

export interface BookSiteVisitInput {
  propertyId: string;
  date: string;
  slot: string;
  notes?: string;
  clientName?: string;
  mobile?: string;
}

export function bookSiteVisit(input: BookSiteVisitInput): Promise<SiteVisit> {
  const property = propertiesStore.find((item) => item.id === input.propertyId);
  const created: SiteVisit = {
    id: `sv-${Date.now()}`,
    propertyId: input.propertyId,
    propertyTitle: property?.title ?? "Property visit",
    clientName: input.clientName?.trim() || "Kaundinya Client",
    mobile: input.mobile?.trim() || "—",
    date: input.date,
    slot: input.slot,
    status: "requested",
    notes: input.notes?.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  };
  siteVisitsStore = [created, ...siteVisitsStore];
  return delay(created);
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
}

export function submitListing(input: SubmitListingInput): Promise<PropertyListing> {
  const created: PropertyListing = {
    id: `prop-${Date.now()}`,
    title: input.title,
    description: input.description,
    listingType: input.listingType,
    propertyType: input.propertyType,
    bhk: input.bhk,
    location: input.location,
    city: "Hyderabad",
    pincode: input.pincode,
    price: input.price,
    priceUnit: input.listingType === "rent" ? "month" : "total",
    areaSqft: input.areaSqft,
    furnishing: input.furnishing,
    amenities: input.amenities,
    images: input.images,
    status: "draft",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  propertiesStore = [created, ...propertiesStore];
  return delay(created);
}

export function fetchValuations(): Promise<ValuationRequest[]> {
  return delay([...valuationsStore]);
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

export function bookValuation(
  input: BookValuationInput
): Promise<ValuationRequest> {
  const created: ValuationRequest = {
    id: `val-${Date.now()}`,
    ownerName: input.ownerName,
    mobile: input.mobile,
    propertyType: input.propertyType,
    location: input.location,
    pincode: input.pincode,
    expectedPrice: input.expectedPrice,
    notes: input.notes,
    status: "requested",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  valuationsStore = [created, ...valuationsStore];
  return delay(created);
}

/* ------------------------------- Insurance ------------------------------- */

let policiesStore: PolicyRecord[] = [...POLICIES];

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoInDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function fetchInsurancePlans(
  filters: { type?: InsuranceType; familyOption?: string } = {}
): Promise<InsurancePlan[]> {
  let list = [...INSURANCE_PLANS];
  if (filters.type) list = list.filter((plan) => plan.type === filters.type);
  if (filters.familyOption) {
    list = list.filter((plan) => plan.familyOption === filters.familyOption);
  }
  return delay(list);
}

export function estimateInsuranceNeeds(
  profile: InsuranceNeedsProfile
): Promise<InsuranceEstimate> {
  const incomeCover = Math.max(profile.annualIncome * (10 + profile.dependents), 2500000);
  const recommendedCoverage = Math.round((incomeCover + profile.liabilities) / 100000) * 100000;
  const ageFactor = 1 + Math.max(0, profile.age - 25) * 0.03;
  const smokerFactor = profile.smoker ? 1.35 : 1;
  const estimatedPremium = Math.round(
    recommendedCoverage * 0.0012 * ageFactor * smokerFactor
  );
  return delay({
    recommendedCoverage,
    estimatedPremium,
    basis: "10× annual income + dependents, plus outstanding liabilities",
  });
}

export function fetchHospitals(pincode?: string): Promise<Hospital[]> {
  let list = [...HOSPITALS];
  if (pincode) {
    const exact = list.filter((hospital) => hospital.pincode === pincode);
    list = exact.length > 0 ? exact : list;
  }
  return delay(list);
}

export function lookupVehicle(
  registrationNumber: string
): Promise<VehicleInfo | null> {
  const normalized = registrationNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return delay(
    VEHICLES.find((vehicle) => vehicle.registrationNumber === normalized) ?? null,
    450
  );
}

export function getMotorQuote(vehicle: VehicleInfo): Promise<VehicleQuote> {
  const plan =
    INSURANCE_PLANS.find((item) => item.type === "motor") ?? INSURANCE_PLANS[0];
  const addOns = ["Zero depreciation", "Engine protect"];
  return delay({
    plan,
    vehicle,
    addOns,
    totalPremium: plan.premium + addOns.length * 1200,
  });
}

export function purchaseMotorPolicy(
  planId: string,
  vehicle: VehicleInfo,
  addOns: string[] = []
): Promise<PolicyRecord> {
  const plan =
    INSURANCE_PLANS.find((item) => item.id === planId) ??
    INSURANCE_PLANS.find((item) => item.type === "motor");
  if (!plan) return Promise.reject(new Error("Motor plan unavailable"));
  const created: PolicyRecord = {
    id: `pol-${Date.now()}`,
    type: "Motor",
    provider: plan.insurer,
    policyNumber: `MOT-${vehicle.registrationNumber.slice(-4)}-${Date.now()
      .toString()
      .slice(-6)}`,
    coverAmount: plan.sumInsured,
    premium: plan.premium + addOns.length * 1200,
    renewalDate: isoInDays(365),
    status: "active",
    holder: "Kaundinya Client",
    validFrom: isoToday(),
  };
  policiesStore = [created, ...policiesStore];
  return delay(created, 900);
}

export function fetchPolicies(): Promise<PolicyRecord[]> {
  return delay([...policiesStore]);
}

export function downloadPolicy(id: string): Promise<{ fileName: string }> {
  const policy = policiesStore.find((item) => item.id === id);
  return delay({
    fileName: `${policy?.policyNumber ?? "policy"}.pdf`,
  });
}

/* ----------------------------- Home services ----------------------------- */

let measurementsStore: MeasurementBooking[] = [...MEASUREMENTS];
let jobsStore: JobRecord[] = [...JOBS];
let documentsStore: DocumentRecord[] = [...DOCUMENTS];
let printJobsStore: PrintJob[] = [...PRINT_JOBS];
let interiorStore: InteriorConsultation[] = [...INTERIOR_CONSULTATIONS];

export function fetchMeasurements(): Promise<MeasurementBooking[]> {
  return delay([...measurementsStore]);
}

export interface BookMeasurementInput {
  serviceId: string;
  serviceName: string;
  address: string;
  pincode: string;
  date: string;
  slot: string;
}

export function bookMeasurement(
  input: BookMeasurementInput
): Promise<MeasurementBooking> {
  const created: MeasurementBooking = {
    ...input,
    id: `meas-${Date.now()}`,
    status: "requested",
    createdAt: isoToday(),
  };
  measurementsStore = [created, ...measurementsStore];
  return delay(created);
}

export function fetchJobs(): Promise<JobRecord[]> {
  return delay([...jobsStore]);
}

export function fetchJob(id: string): Promise<JobRecord | null> {
  return delay(jobsStore.find((job) => job.id === id) ?? null);
}

export interface CreateJobInput {
  serviceId: string;
  serviceName: string;
  issueTypes: string[];
  address: string;
  pincode: string;
  date?: string;
  slot?: string;
  amount?: number;
}

export function createJob(input: CreateJobInput): Promise<JobRecord> {
  const created: JobRecord = {
    id: `job-${Date.now()}`,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    status: "requested",
    technician: null,
    scheduledAt: input.date && input.slot ? `${input.date} · ${input.slot}` : null,
    startOtp: null,
    rating: null,
    address: `${input.address}, ${input.pincode}`,
    issueTypes: input.issueTypes,
    amount: input.amount,
    createdAt: isoToday(),
  };
  jobsStore = [created, ...jobsStore];
  return delay(created);
}

export function requestJobStartOtp(
  jobId: string
): Promise<{ otp: string; expiresInSeconds: number }> {
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  jobsStore = jobsStore.map((job) =>
    job.id === jobId ? { ...job, startOtp: otp } : job
  );
  return delay({ otp, expiresInSeconds: 600 });
}

export function rateJob(
  jobId: string,
  stars: number,
  comment?: string
): Promise<JobRecord | null> {
  jobsStore = jobsStore.map((job) =>
    job.id === jobId
      ? { ...job, rating: stars, ratingComment: comment?.trim() || undefined }
      : job
  );
  return delay(jobsStore.find((job) => job.id === jobId) ?? null);
}

export function fetchDocuments(): Promise<DocumentRecord[]> {
  return delay([...documentsStore]);
}

export interface UploadDocumentInput {
  docType: string;
  fileName: string;
}

export function uploadDocument(
  input: UploadDocumentInput
): Promise<DocumentRecord> {
  const created: DocumentRecord = {
    id: `doc-${Date.now()}`,
    docType: input.docType,
    fileName: input.fileName,
    watermark: "For Kaundinya ID Update Only",
    createdAt: isoToday(),
  };
  documentsStore = [created, ...documentsStore];
  return delay(created, 800);
}

export function fetchPrintJobs(): Promise<PrintJob[]> {
  return delay([...printJobsStore]);
}

export interface CreatePrintJobInput {
  fileName: string;
  copies: number;
}

export function createPrintJob(input: CreatePrintJobInput): Promise<PrintJob> {
  const created: PrintJob = {
    id: `print-${Date.now()}`,
    fileName: input.fileName,
    copies: input.copies,
    price: input.copies * 10,
    status: "queued",
    autoDeletedAt: isoInDays(1),
    createdAt: isoToday(),
  };
  printJobsStore = [created, ...printJobsStore];
  return delay(created, 700);
}

export function fetchInteriorConsultations(): Promise<InteriorConsultation[]> {
  return delay([...interiorStore]);
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
  const created: InteriorConsultation = {
    ...input,
    id: `int-${Date.now()}`,
    status: "requested",
    createdAt: isoToday(),
  };
  interiorStore = [created, ...interiorStore];
  return delay(created);
}

/* --------------------------------- Loans --------------------------------- */

let loansStore: LoanApplication[] = [...LOANS];

export function calculateEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number
): Promise<EmiResult> {
  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi =
    monthlyRate === 0
      ? principal / tenureMonths
      : (principal * monthlyRate * factor) / (factor - 1);
  const totalPayable = emi * tenureMonths;
  return delay(
    {
      emi: Math.round(emi),
      totalInterest: Math.round(totalPayable - principal),
      totalPayable: Math.round(totalPayable),
    },
    250
  );
}

export function estimateLoanEligibility(
  monthlyIncome: number,
  obligations: number,
  age: number,
  employmentType: "salaried" | "self-employed"
): Promise<LoanEligibility> {
  const foir = employmentType === "salaried" ? 0.55 : 0.5;
  const availableEmi = Math.max(0, monthlyIncome * foir - obligations);
  const maxTenureMonths = age >= 50 ? 180 : 300;
  const monthlyRate = 8.5 / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, maxTenureMonths);
  const eligibleAmount = Math.round(
    (availableEmi * (factor - 1)) / (monthlyRate * factor)
  );
  return delay(
    {
      eligibleAmount,
      maxTenureMonths,
      estimatedEmi: Math.round(availableEmi),
      note: "Indicative only. Final sanction depends on credit profile and lender policy.",
    },
    400
  );
}

export function fetchLoanApplications(): Promise<LoanApplication[]> {
  return delay([...loansStore]);
}

export function fetchLoanApplication(
  id: string
): Promise<LoanApplication | null> {
  return delay(loansStore.find((loan) => loan.id === id) ?? null);
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
  const created: LoanApplication = {
    id: `loan-${Date.now()}`,
    loanType: input.loanType,
    amount: input.amount,
    status: "application",
    bank: null,
    createdAt: isoToday(),
    monthlyIncome: input.monthlyIncome,
    tenureMonths: input.tenureMonths,
    employmentType: input.employmentType,
    purpose: input.purpose,
    documents: input.documents,
    advisor: null,
    propertyId: input.propertyId,
  };
  loansStore = [created, ...loansStore];
  return delay(created, 900);
}

export function checkCreditHealth(): Promise<CreditHealth> {
  return delay(
    {
      scoreBand: "good",
      eligibleProducts: [
        "Home loan up to ₹65 L",
        "Loan against property up to ₹45 L",
        "Personal loan up to ₹8 L",
      ],
      note: "Soft pull only — this check does not affect your CIBIL score.",
    },
    1200
  );
}

export function lookupGstin(gstin: string): Promise<GstinInfo | null> {
  if (gstin.replace(/\s/g, "").length !== 15) return delay(null, 400);
  return delay(
    {
      gstin: gstin.toUpperCase(),
      legalName: "Kaundinya Traders",
      address: "Plot 14, Kukatpally Industrial Area, Hyderabad, 500072",
      turnover: "₹1.2 Cr (FY 2025-26)",
    },
    600
  );
}

/* --------------------------------- Auth --------------------------------- */

export interface OtpVerifyResult {
  token: string;
  user: User;
}

/** POST /api/otp/send — currently mocked. */
export function otpSend(_mobile: string): Promise<{ expiresInSeconds: number }> {
  return delay({ expiresInSeconds: 60 });
}

/** POST /api/otp/verify — currently mocked (accepts any 6-digit code). */
export function otpVerify(mobile: string, otp: string): Promise<OtpVerifyResult> {
  if (!/^\d{6}$/.test(otp)) {
    return Promise.reject(new Error("Invalid OTP"));
  }
  return delay({
    token: `mock-${mobile}`,
    user: { name: "Kaundinya Client", email: "", mobile },
  });
}
