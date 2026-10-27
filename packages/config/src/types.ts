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
