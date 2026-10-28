import type {
  ClientRecord,
  Enquiry,
  RequestStatus,
  Staff,
} from "@kaundinya/config";

export const STAFF: Staff[] = [
  { id: "st-1", name: "Sampath Krishna Goud", email: "sampath@kaundinya.com", role: "admin", active: true },
  { id: "st-2", name: "Harika Garre", email: "harika@kaundinya.com", role: "agent", active: true },
  { id: "st-3", name: "Priya Sharma", email: "priya@kaundinya.com", role: "agent", active: true },
  { id: "st-4", name: "Rajesh Nair", email: "rajesh@kaundinya.com", role: "agent", active: true },
];

export const ENQUIRIES: Enquiry[] = [
  {
    id: "enq-1001",
    fullName: "Ramesh Bujji",
    email: "gudipudimani63@gmail.com",
    mobile: "8688493369",
    serviceCategory: "Insurance",
    specificService: "Comprehensive health & family floater insurance",
    pinCode: "522617",
    comments: "Family floater plan for 4 members.",
    consent: true,
    status: "new",
    priority: "high",
    assignedTo: null,
    followUpAt: "2026-10-28",
    source: "marketing",
    createdAt: "2026-10-24",
    notes: [],
  },
  {
    id: "enq-1002",
    fullName: "Sita Reddy",
    email: "sita.reddy@example.com",
    mobile: "9876543210",
    serviceCategory: "Real Estate",
    specificService: "Property buying assistance",
    pinCode: "500081",
    comments: "Looking for a 3BHK near Hitec City.",
    consent: true,
    status: "contacted",
    priority: "medium",
    assignedTo: "st-2",
    followUpAt: "2026-10-29",
    source: "marketing",
    createdAt: "2026-10-23",
    notes: [
      { id: "n-1", author: "Harika Garre", text: "Called client, scheduled site visit.", createdAt: "2026-10-24" },
    ],
  },
  {
    id: "enq-1003",
    fullName: "Arjun Rao",
    email: "arjun.rao@example.com",
    mobile: "9123456780",
    serviceCategory: "Loans",
    specificService: "Home loans for purchase & construction",
    pinCode: "500032",
    comments: "Need help with documentation for a home loan.",
    consent: true,
    status: "qualified",
    priority: "high",
    assignedTo: "st-4",
    followUpAt: "2026-10-27",
    source: "marketing",
    createdAt: "2026-10-22",
    notes: [
      { id: "n-2", author: "Rajesh Nair", text: "Eligibility confirmed, sharing lender options.", createdAt: "2026-10-23" },
    ],
  },
  {
    id: "enq-1004",
    fullName: "Meera Nair",
    email: "meera.nair@example.com",
    mobile: "9012345678",
    serviceCategory: "Property Management & Home Services",
    specificService: "Pigeon safety nets & invisible grills installation",
    pinCode: "500034",
    comments: "Balcony netting for a 3rd floor apartment.",
    consent: true,
    status: "converted",
    priority: "medium",
    assignedTo: "st-3",
    followUpAt: null,
    source: "marketing",
    createdAt: "2026-10-20",
    notes: [
      { id: "n-3", author: "Priya Sharma", text: "Converted to paid installation request.", createdAt: "2026-10-21" },
    ],
  },
  {
    id: "enq-1005",
    fullName: "Karthik V",
    email: "karthik.v@example.com",
    mobile: "9345678901",
    serviceCategory: "Insurance",
    specificService: "Four-wheeler motor insurance",
    pinCode: "500018",
    comments: "Renewal for existing car policy.",
    consent: false,
    status: "lost",
    priority: "low",
    assignedTo: "st-2",
    followUpAt: null,
    source: "marketing",
    createdAt: "2026-10-19",
    notes: [
      { id: "n-4", author: "Harika Garre", text: "Client renewed elsewhere.", createdAt: "2026-10-20" },
    ],
  },
  {
    id: "enq-1006",
    fullName: "Divya S",
    email: "divya.s@example.com",
    mobile: "9456789012",
    serviceCategory: "Real Estate",
    specificService: "Property rentals (Residential & Commercial)",
    pinCode: "500084",
    comments: "Needs a 2BHK rental from next month.",
    consent: true,
    status: "new",
    priority: "medium",
    assignedTo: null,
    followUpAt: null,
    source: "marketing",
    createdAt: "2026-10-25",
    notes: [],
  },
  {
    id: "enq-1007",
    fullName: "Vikram T",
    email: "vikram.t@example.com",
    mobile: "9567890123",
    serviceCategory: "Loans",
    specificService: "Business loans for working capital & expansion",
    pinCode: "500081",
    comments: "Working capital for a retail expansion.",
    consent: true,
    status: "contacted",
    priority: "high",
    assignedTo: "st-1",
    followUpAt: "2026-10-26",
    source: "marketing",
    createdAt: "2026-10-21",
    notes: [
      { id: "n-5", author: "Sampath Krishna Goud", text: "Initial call done, awaiting financials.", createdAt: "2026-10-22" },
    ],
  },
];

export const CLIENTS: ClientRecord[] = [
  { id: "cl-1", name: "Ramesh Bujji", email: "gudipudimani63@gmail.com", mobile: "8688493369", joinedAt: "2026-10-24", requestsCount: 1, verified: true },
  { id: "cl-2", name: "Meera Nair", email: "meera.nair@example.com", mobile: "9012345678", joinedAt: "2026-10-20", requestsCount: 2, verified: true },
  { id: "cl-3", name: "Arjun Rao", email: "arjun.rao@example.com", mobile: "9123456780", joinedAt: "2026-10-22", requestsCount: 1, verified: true },
  { id: "cl-4", name: "Sita Reddy", email: "sita.reddy@example.com", mobile: "9876543210", joinedAt: "2026-10-23", requestsCount: 1, verified: true },
  { id: "cl-5", name: "Divya S", email: "divya.s@example.com", mobile: "9456789012", joinedAt: "2026-10-25", requestsCount: 0, verified: true },
];

export interface AdminRequest {
  id: string;
  clientName: string;
  mobile: string;
  serviceCategory: string;
  specificService: string;
  status: RequestStatus;
  assignedTo: string | null;
  createdAt: string;
  comments: string;
}

export const ADMIN_REQUESTS: AdminRequest[] = [
  { id: "req-1001", clientName: "Ramesh Bujji", mobile: "8688493369", serviceCategory: "Insurance", specificService: "Comprehensive health & family floater insurance", status: "in_progress", assignedTo: "st-3", createdAt: "2026-10-24", comments: "Family floater plan for 4 members." },
  { id: "req-1002", clientName: "Meera Nair", mobile: "9012345678", serviceCategory: "Property Management & Home Services", specificService: "Pigeon safety nets & invisible grills installation", status: "completed", assignedTo: "st-3", createdAt: "2026-10-20", comments: "Balcony netting for a 3rd floor apartment." },
  { id: "req-1003", clientName: "Arjun Rao", mobile: "9123456780", serviceCategory: "Loans", specificService: "Home loans for purchase & construction", status: "in_progress", assignedTo: "st-4", createdAt: "2026-10-22", comments: "Need help with documentation for a home loan." },
  { id: "req-1004", clientName: "Sita Reddy", mobile: "9876543210", serviceCategory: "Real Estate", specificService: "Property buying assistance", status: "new", assignedTo: null, createdAt: "2026-10-23", comments: "Looking for a 3BHK near Hitec City." },
  { id: "req-1005", clientName: "Divya S", mobile: "9456789012", serviceCategory: "Real Estate", specificService: "Property rentals (Residential & Commercial)", status: "new", assignedTo: null, createdAt: "2026-10-25", comments: "Needs a 2BHK rental from next month." },
  { id: "req-1006", clientName: "Vikram T", mobile: "9567890123", serviceCategory: "Loans", specificService: "Business loans for working capital & expansion", status: "in_progress", assignedTo: "st-1", createdAt: "2026-10-21", comments: "Working capital for a retail expansion." },
];
