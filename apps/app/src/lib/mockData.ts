import type { AppNotification, ServiceRequest } from "@kaundinya/config";

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "req-1001",
    serviceCategory: "Real Estate",
    specificService: "Property Rentals (Residential)",
    status: "in_progress",
    createdAt: "2026-10-22",
    comments: "Looking for a 2BHK in Gachibowli with parking.",
  },
  {
    id: "req-1002",
    serviceCategory: "Insurance",
    specificService: "Comprehensive Health Insurance",
    status: "new",
    createdAt: "2026-10-24",
    comments: "Family floater plan for 4 members.",
  },
  {
    id: "req-1003",
    serviceCategory: "Property Management & Home Services",
    specificService: "Pigeon Safety Nets Installation",
    status: "completed",
    createdAt: "2026-10-15",
    comments: "Balcony netting for a 3rd floor apartment.",
  },
  {
    id: "req-1004",
    serviceCategory: "Loans",
    specificService: "Home Loan (Purchase / Construction)",
    status: "in_progress",
    createdAt: "2026-10-18",
    comments: "Need help with documentation for a home loan.",
  },
  {
    id: "req-1005",
    serviceCategory: "Real Estate",
    specificService: "Property Buying Assistance",
    status: "completed",
    createdAt: "2026-10-05",
    comments: "Independent house near Miyapur.",
  },
  {
    id: "req-1006",
    serviceCategory: "Insurance",
    specificService: "Four-Wheeler Motor Insurance",
    status: "cancelled",
    createdAt: "2026-10-09",
    comments: "Renewal for existing car policy.",
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf-1",
    title: "Request received",
    message: "Your insurance enquiry has been received. Our team will reach out shortly.",
    createdAt: "2026-10-24",
    read: false,
  },
  {
    id: "ntf-2",
    title: "Status update",
    message: "Your Real Estate rental request is now in progress.",
    createdAt: "2026-10-23",
    read: false,
    kind: "request",
    href: "/requests/req-1001",
  },
  {
    id: "ntf-3",
    title: "Request completed",
    message: "Pigeon safety nets installation has been marked as completed.",
    createdAt: "2026-10-16",
    read: true,
    kind: "job",
    href: "/jobs/job-5002",
  },
];
