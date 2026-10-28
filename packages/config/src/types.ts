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

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
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
