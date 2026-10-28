import { SERVICE_CATALOG } from "@kaundinya/config";
import type { ServiceCatalogItem, ServiceCategoryId } from "@kaundinya/config";

export interface AdminService {
  id: string;
  categoryId: ServiceCategoryId;
  name: string;
  summary: string;
  pricingLabel: string;
  active: boolean;
}

function pricingLabel(item: ServiceCatalogItem) {
  if (!item.pricing) return "Custom quote";
  const { model, amount, unit } = item.pricing;
  if (model === "per-sqft" && amount) return `₹${amount}/${unit}`;
  if (model === "fixed") {
    return amount === 0 ? "Free" : `₹${amount}${unit ? `/${unit}` : ""}`;
  }
  if (model === "from" && amount) return `From ₹${amount}`;
  return "Custom quote";
}

export const ADMIN_SERVICES: AdminService[] = SERVICE_CATALOG.map((item) => ({
  id: item.id,
  categoryId: item.categoryId,
  name: item.name,
  summary: item.summary,
  pricingLabel: pricingLabel(item),
  active: true,
}));

export type AdminPropertyStatus =
  | "draft"
  | "active"
  | "sold"
  | "rented"
  | "rejected";

export interface AdminProperty {
  id: string;
  title: string;
  ownerName: string;
  location: string;
  pincode: string;
  listingType: "Rent" | "Sale";
  price: number;
  status: AdminPropertyStatus;
  submittedAt: string;
}

export type AdminValuationStatus = "requested" | "scheduled" | "completed";

export interface AdminValuation {
  id: string;
  ownerName: string;
  mobile: string;
  propertyType: string;
  location: string;
  expectedPrice: number;
  status: AdminValuationStatus;
  createdAt: string;
}

export type AdminVisitStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface AdminSiteVisit {
  id: string;
  propertyTitle: string;
  clientName: string;
  mobile: string;
  date: string;
  slot: string;
  status: AdminVisitStatus;
  adviserId: string | null;
}

export interface AdminJob {
  id: string;
  serviceName: string;
  clientName: string;
  mobile: string;
  address: string;
  status: string;
  technicianId: string | null;
  scheduledAt: string | null;
  amount: number;
  rating: number | null;
}

export interface AdminRenewal {
  id: string;
  clientName: string;
  provider: string;
  policyType: string;
  policyNumber: string;
  renewalDate: string;
  premium: number;
  reminderSent: boolean;
}

export const ADMIN_PROPERTIES: AdminProperty[] = [
  { id: "prop-1", title: "Bright 2 BHK near Gachibowli ORR", ownerName: "Sita Reddy", location: "Gachibowli", pincode: "500032", listingType: "Rent", price: 28000, status: "active", submittedAt: "2026-10-20" },
  { id: "prop-2", title: "Furnished 3 BHK in Kondapur", ownerName: "Meera Nair", location: "Kondapur", pincode: "500084", listingType: "Rent", price: 42000, status: "active", submittedAt: "2026-10-22" },
  { id: "prop-3", title: "3 BHK with Hitec City skyline view", ownerName: "Arjun Rao", location: "Hitec City", pincode: "500081", listingType: "Sale", price: 14500000, status: "active", submittedAt: "2026-10-18" },
  { id: "prop-4", title: "4 BHK villa in Kompally", ownerName: "Vikram T", location: "Kompally", pincode: "500014", listingType: "Sale", price: 23500000, status: "draft", submittedAt: "2026-10-26" },
  { id: "prop-5", title: "Commercial office space in Madhapur", ownerName: "Divya S", location: "Madhapur", pincode: "500081", listingType: "Rent", price: 65000, status: "draft", submittedAt: "2026-10-27" },
  { id: "prop-6", title: "Independent house in Miyapur", ownerName: "Karthik V", location: "Miyapur", pincode: "500049", listingType: "Sale", price: 11500000, status: "sold", submittedAt: "2026-10-08" },
  { id: "prop-7", title: "East-facing plot near Shamshabad", ownerName: "Ramesh Bujji", location: "Shamshabad", pincode: "501218", listingType: "Sale", price: 5500000, status: "rejected", submittedAt: "2026-10-10" },
];

export const ADMIN_VALUATIONS: AdminValuation[] = [
  { id: "val-1", ownerName: "Meera Nair", mobile: "9012345678", propertyType: "Apartment", location: "Kukatpally", expectedPrice: 8500000, status: "scheduled", createdAt: "2026-10-22" },
  { id: "val-2", ownerName: "Ramesh Bujji", mobile: "8688493369", propertyType: "Independent House", location: "Miyapur", expectedPrice: 12000000, status: "requested", createdAt: "2026-10-26" },
  { id: "val-3", ownerName: "Divya S", mobile: "9456789012", propertyType: "Apartment", location: "Kondapur", expectedPrice: 7200000, status: "requested", createdAt: "2026-10-27" },
  { id: "val-4", ownerName: "Sita Reddy", mobile: "9876543210", propertyType: "Villa", location: "Kompally", expectedPrice: 22000000, status: "completed", createdAt: "2026-10-15" },
];

export const ADMIN_SITE_VISITS: AdminSiteVisit[] = [
  { id: "sv-1", propertyTitle: "3 BHK with Hitec City skyline view", clientName: "Sita Reddy", mobile: "9876543210", date: "2026-10-29", slot: "11:30 AM", status: "confirmed", adviserId: "st-2" },
  { id: "sv-2", propertyTitle: "Bright 2 BHK near Gachibowli ORR", clientName: "Divya S", mobile: "9456789012", date: "2026-10-30", slot: "04:30 PM", status: "requested", adviserId: null },
  { id: "sv-3", propertyTitle: "Furnished 3 BHK in Kondapur", clientName: "Arjun Rao", mobile: "9123456780", date: "2026-10-31", slot: "10:00 AM", status: "requested", adviserId: "st-3" },
  { id: "sv-4", propertyTitle: "4 BHK villa in Kompally", clientName: "Meera Nair", mobile: "9012345678", date: "2026-10-25", slot: "03:00 PM", status: "completed", adviserId: "st-4" },
];

export const ADMIN_JOBS: AdminJob[] = [
  { id: "job-1", serviceName: "Pigeon Safety Nets", clientName: "Meera Nair", mobile: "9012345678", address: "Kondapur, 500084", status: "in_progress", technicianId: "st-3", scheduledAt: "2026-10-27", amount: 8500, rating: null },
  { id: "job-2", serviceName: "AC Deep Clean", clientName: "Ramesh Bujji", mobile: "8688493369", address: "Gachibowli, 500032", status: "completed", technicianId: "st-4", scheduledAt: "2026-10-18", amount: 1798, rating: 5 },
  { id: "job-3", serviceName: "AC & Refrigerator Service", clientName: "Divya S", mobile: "9456789012", address: "Kukatpally, 500072", status: "en_route", technicianId: "st-4", scheduledAt: "2026-10-28", amount: 899, rating: null },
  { id: "job-4", serviceName: "Invisible Grills", clientName: "Sita Reddy", mobile: "9876543210", address: "Hitec City, 500081", status: "requested", technicianId: null, scheduledAt: null, amount: 16800, rating: null },
  { id: "job-5", serviceName: "Aadhaar Update", clientName: "Arjun Rao", mobile: "9123456780", address: "Kondapur, 500084", status: "completed", technicianId: "st-2", scheduledAt: "2026-10-22", amount: 299, rating: 4 },
];

export const ADMIN_RENEWALS: AdminRenewal[] = [
  { id: "ren-1", clientName: "Kaundinya Client", provider: "ICICI Lombard", policyType: "Motor", policyNumber: "IL-CAR-991237", renewalDate: "2026-11-08", premium: 9280, reminderSent: false },
  { id: "ren-2", clientName: "Meera Nair", provider: "Star Health", policyType: "Health", policyNumber: "SH-FAM-884120", renewalDate: "2026-12-14", premium: 18400, reminderSent: false },
  { id: "ren-3", clientName: "Arjun Rao", provider: "HDFC Life", policyType: "Life & Term", policyNumber: "HL-TERM-441902", renewalDate: "2027-03-18", premium: 11880, reminderSent: true },
  { id: "ren-4", clientName: "Sita Reddy", provider: "Bajaj Allianz", policyType: "Property", policyNumber: "BA-HOME-552210", renewalDate: "2026-11-21", premium: 6400, reminderSent: false },
];
