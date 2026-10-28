import type {
  ModuleStage,
  ServiceCatalogItem,
  ServiceCategory,
  ServiceCategoryId,
} from "./types";

export const SITE_INFO = {
  name: "Kaundinya Consultancy",
  shortName: "KIS",
  fullName: "Kaundinya Integrated Services",
  tagline: "Trusted Guidance. Complete Solutions.",
  description:
    "Integrated professional consultancy for real estate, insurance, property management, home services, and loans across Hyderabad and surrounding areas.",
  serviceArea: "Hyderabad and surrounding areas, Telangana, India",
  establishedNotice: "Professional Integrated Services in Telangana",
  url: "https://kaundinyaconsultancy.com",
};

export const CONTACT_PERSONS = [
  {
    name: "Sampath Krishna Goud",
    role: "Managing Director / Principal",
    phone: "+91 70933 20947",
    phoneRaw: "+917093320947",
    primary: true,
  },
  {
    name: "Harika Garre",
    role: "Managing Partner",
    phone: "+91 96322 40116",
    phoneRaw: "+919632240116",
    primary: false,
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "real-estate",
    name: "Real Estate",
    slug: "real-estate",
    tagline: "Transparent property assistance tailored to your residential & commercial needs.",
    description:
      "Whether you are looking to rent a comfortable home, purchase your ideal property, or sell an asset in Hyderabad, we provide practical, end-to-end guidance without high-pressure tactics.",
    services: [
      "Property rentals (Residential & Commercial)",
      "Property buying assistance",
      "Property selling assistance",
      "Tenant coordination & rental agreements",
    ],
    href: "/services/real-estate",
    image: "/images/real_estate.webp",
    icon: "Building2",
  },
  {
    id: "insurance",
    name: "Insurance",
    slug: "insurance",
    tagline: "Independent guidance to protect what matters most to your family and business.",
    description:
      "Navigating policy terms, coverage tiers, and exclusions can be overwhelming. We help you evaluate and choose fitting life, health, motor, and property insurance plans tailored to your real requirements.",
    services: [
      "Life & term insurance advisory",
      "Comprehensive health & family floater insurance",
      "Two-wheeler & four-wheeler motor insurance",
      "Residential & commercial property insurance",
    ],
    href: "/services/insurance",
    image: "/images/insurance.webp",
    icon: "ShieldCheck",
  },
  {
    id: "property-home-services",
    name: "Property Management & Home Services",
    slug: "property-home-services",
    tagline: "Vetted technicians and dependable support for hassle-free home maintenance.",
    description:
      "From essential balcony pigeon nets and invisible safety grills to regular appliance maintenance, interior coordination, and civic document support, we handle the coordination so you don't have to.",
    services: [
      "Pigeon safety nets & invisible grills installation",
      "Air conditioner (AC) & refrigerator servicing",
      "Aadhaar & voter ID update assistance coordination",
      "Interior design & modular fitout consultation",
    ],
    href: "/services/property-home-services",
    image: "/images/home_services.webp",
    icon: "Wrench",
  },
  {
    id: "loans",
    name: "Loans",
    slug: "loans",
    tagline: "Objective loan evaluation and transparent documentation guidance.",
    description:
      "Compare lending options, evaluate eligibility criteria, and streamline your documentation for home, personal, business, or mortgage loans with clear, factual advice.",
    services: [
      "Home loans for purchase & construction",
      "Personal loans for immediate liquidity",
      "Business loans for working capital & expansion",
      "Loan against property (Mortgage loans)",
    ],
    href: "/services/loans",
    image: "/images/loans.webp",
    icon: "Coins",
  },
];

/** Domain-specific pipelines. Stage ids are what RequestEnvelope.status holds. */
export const MODULE_STAGES: Record<ServiceCategoryId, ModuleStage[]> = {
  "real-estate": [
    { id: "submitted", label: "Submitted", description: "Requirement captured" },
    { id: "matching", label: "Matching", description: "Shortlisting properties" },
    { id: "site_visit", label: "Site Visit", description: "Visits scheduled" },
    { id: "negotiation", label: "Negotiation", description: "Terms being agreed" },
    { id: "documentation", label: "Documentation", description: "Agreement & registration" },
    { id: "closed", label: "Closed", description: "Deal completed" },
  ],
  insurance: [
    { id: "needs_analysis", label: "Needs Analysis", description: "Cover & budget scoped" },
    { id: "quotes", label: "Quotes", description: "Options compared" },
    { id: "consultation", label: "Consultation", description: "Expert walkthrough" },
    { id: "application", label: "Application", description: "Proposal submitted" },
    { id: "issued", label: "Issued", description: "Policy active" },
  ],
  "property-home-services": [
    { id: "requested", label: "Requested", description: "Job raised" },
    { id: "assigned", label: "Assigned", description: "Technician allocated" },
    { id: "en_route", label: "En Route", description: "Technician on the way" },
    { id: "in_progress", label: "In Progress", description: "Work underway" },
    { id: "completed", label: "Completed", description: "Job signed off" },
  ],
  loans: [
    { id: "application", label: "Application", description: "Details captured" },
    { id: "verified", label: "Verified", description: "KYC & documents checked" },
    { id: "submitted", label: "Submitted", description: "Sent to lender" },
    { id: "approved", label: "Approved", description: "Sanction received" },
    { id: "disbursed", label: "Disbursed", description: "Funds credited" },
  ],
};

export const MODULE_META: Record<
  ServiceCategoryId,
  { name: string; shortName: string; icon: string; description: string }
> = {
  "real-estate": {
    name: "Real Estate",
    shortName: "Property",
    icon: "Building2",
    description: "Search, rent, buy, list or value a property with local guidance.",
  },
  insurance: {
    name: "Insurance",
    shortName: "Insurance",
    icon: "ShieldCheck",
    description: "Needs analysis, comparisons and renewals for life, health and motor.",
  },
  "property-home-services": {
    name: "Property Management & Home Services",
    shortName: "Home Services",
    icon: "Wrench",
    description: "Vetted technicians for nets, grills, AC service, interiors and more.",
  },
  loans: {
    name: "Loans",
    shortName: "Loans",
    icon: "Coins",
    description: "Calculate eligibility and track home, personal or business loans.",
  },
};

export const REAL_ESTATE_AMENITIES = [
  "Covered parking",
  "24/7 security",
  "Power backup",
  "Lift",
  "Gym",
  "Swimming pool",
  "Children's play area",
  "Gated community",
  "Vaastu compliant",
  "Piped gas",
];

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: "re-rent",
    categoryId: "real-estate",
    name: "Property Rentals",
    summary: "Residential and commercial rentals matched to your budget and commute.",
    pricing: { model: "quote", note: "Brokerage disclosed upfront" },
    documents: ["ID proof", "Employment proof", "Previous landlord reference"],
    highlights: ["Verified owners", "Rental agreement support", "Move-in coordination"],
  },
  {
    id: "re-buy",
    categoryId: "real-estate",
    name: "Property Buying Assistance",
    summary: "Shortlists, site visits and due diligence for your next home.",
    pricing: { model: "quote", note: "Success fee only on closed deals" },
    documents: ["PAN", "Aadhaar", "Income proof", "Loan sanction letter"],
    highlights: ["Title verification", "TS-RERA checks", "Registration guidance"],
  },
  {
    id: "re-sell",
    categoryId: "real-estate",
    name: "Property Selling Assistance",
    summary: "Pricing guidance, buyer outreach and paperwork for sellers.",
    pricing: { model: "quote" },
    documents: ["Title deed", "Encumbrance certificate", "Tax receipts"],
    highlights: ["Market pricing report", "Buyer screening", "Transfer support"],
  },
  {
    id: "re-list",
    categoryId: "real-estate",
    name: "List Your Property",
    summary: "Publish your rental or sale listing with photos and features.",
    pricing: { model: "from", amount: 0, unit: "listing", note: "Free during launch" },
    highlights: ["Guided listing wizard", "Photo checklist", "Verified enquiries only"],
  },
  {
    id: "re-valuation",
    categoryId: "real-estate",
    name: "Free Property Valuation",
    summary: "Physical assessment by an expert with a written price estimate.",
    pricing: { model: "fixed", amount: 0, unit: "visit", note: "No obligation" },
    highlights: ["On-site assessment", "Comparable sales report", "Rent or sale estimate"],
  },
  {
    id: "re-site-visit",
    categoryId: "real-estate",
    name: "Book a Site Visit",
    summary: "Pick a date and slot; we coordinate with the owner or builder.",
    pricing: { model: "fixed", amount: 0, unit: "visit" },
    highlights: ["Pick your own slot", "Escorted visit", "Instant confirmation"],
  },
  {
    id: "ins-life",
    categoryId: "insurance",
    name: "Life & Term Insurance",
    summary: "Cover calculations based on income, dependents and liabilities.",
    pricing: { model: "quote" },
    tiers: [
      { id: "term-basic", label: "Term Basic", description: "Pure protection", priceHint: "From ₹490/mo" },
      { id: "term-plus", label: "Term Plus", description: "Critical illness rider", priceHint: "From ₹780/mo" },
    ],
  },
  {
    id: "ins-health",
    categoryId: "insurance",
    name: "Health & Family Floater",
    summary: "Family cover with network hospital and waiting-period clarity.",
    pricing: { model: "quote" },
    tiers: [
      { id: "health-self", label: "Self", description: "Individual cover", priceHint: "From ₹650/mo" },
      { id: "health-couple", label: "Self + Spouse", description: "Couple floater", priceHint: "From ₹1,150/mo" },
      { id: "health-parents", label: "Parents", description: "Senior citizen cover", priceHint: "From ₹1,900/mo" },
    ],
    highlights: ["Cashless network guidance", "Pre-existing condition review", "Claim support"],
  },
  {
    id: "ins-motor",
    categoryId: "insurance",
    name: "Motor Insurance",
    summary: "Two-wheeler and car policy renewal with a fast quote lane.",
    pricing: { model: "quote" },
    highlights: ["Vehicle lookup", "Add-on comparison", "Policy PDF by email"],
  },
  {
    id: "ins-property",
    categoryId: "insurance",
    name: "Property Insurance",
    summary: "Residential and commercial cover against fire and natural events.",
    pricing: { model: "quote" },
  },
  {
    id: "hs-nets",
    categoryId: "property-home-services",
    name: "Pigeon Safety Nets",
    summary: "Measured and installed UV-stabilised nets for balconies and windows.",
    pricing: { model: "per-sqft", amount: 85, unit: "sq.ft", note: "Measurement included" },
    highlights: ["Free laser measurement", "10-year net warranty", "Same-week install"],
  },
  {
    id: "hs-grills",
    categoryId: "property-home-services",
    name: "Invisible Grills",
    summary: "Coated stainless-steel grills for open balconies and windows.",
    pricing: { model: "per-sqft", amount: 140, unit: "sq.ft" },
    highlights: ["Corrosion resistant", "Child and pet safe", "Custom spacing"],
  },
  {
    id: "hs-ac",
    categoryId: "property-home-services",
    name: "AC & Refrigerator Service",
    summary: "Diagnostic-first appliance care with transparent tiers.",
    pricing: { model: "fixed", amount: 499, unit: "visit" },
    tiers: [
      { id: "ac-basic", label: "Basic Service", description: "Clean filters, check gas", priceHint: "₹499" },
      { id: "ac-deep", label: "Deep Clean", description: "Jet wash + coil clean", priceHint: "₹899" },
      { id: "ac-gas", label: "Gas Refill", description: "Top-up with leak test", priceHint: "₹2,499" },
    ],
    issueTypes: ["Not cooling", "Water leaking", "Noise", "Bad smell", "Not starting"],
  },
  {
    id: "hs-electrical",
    categoryId: "property-home-services",
    name: "Electrical & Plumbing",
    summary: "Licensed technicians for wiring, fittings and leak repairs.",
    pricing: { model: "quote", note: "Quoted after diagnosis" },
    issueTypes: ["House wiring", "Switch/socket", "Fan/light fitting", "Water leak", "Motor/pump"],
  },
  {
    id: "hs-interiors",
    categoryId: "property-home-services",
    name: "Interiors & Modular Fitout",
    summary: "Design consultation and modular kitchen, wardrobe and storage work.",
    pricing: { model: "quote" },
    highlights: ["Portfolio walkthrough", "Material options", "Timeline plan"],
  },
  {
    id: "hs-documents",
    categoryId: "property-home-services",
    name: "Document Services",
    summary: "Coordinated Aadhaar and voter ID updates at a secure portal.",
    pricing: { model: "fixed", amount: 299, unit: "update" },
    issueTypes: ["Aadhaar update", "Voter ID update", "Address change", "Name correction"],
    documents: ["Existing ID", "Address proof"],
  },
  {
    id: "hs-printouts",
    categoryId: "property-home-services",
    name: "Printouts",
    summary: "Upload a PDF, we print and deliver. Files auto-delete after printing.",
    pricing: { model: "per-sqft", amount: 10, unit: "page" },
    highlights: ["Live pricing", "Auto-delete after print", "Home delivery"],
  },
  {
    id: "ln-home",
    categoryId: "loans",
    name: "Home Loan",
    summary: "Purchase, construction or plot loans with eligibility estimation.",
    pricing: { model: "quote" },
    documents: ["PAN", "Aadhaar", "3 months payslips", "6 months bank statement", "ITR"],
    highlights: ["EMI calculator", "5-step tracker", "Multi-lender comparison"],
  },
  {
    id: "ln-personal",
    categoryId: "loans",
    name: "Personal Loan",
    summary: "Unsecured loans with salaried and self-employed pathways.",
    pricing: { model: "quote" },
    documents: ["PAN", "Aadhaar", "Income proof", "Bank statement"],
  },
  {
    id: "ln-business",
    categoryId: "loans",
    name: "Business Loan",
    summary: "Working capital and expansion funding with GSTIN autofill.",
    pricing: { model: "quote" },
    documents: ["GSTIN", "P&L", "Bank statement", "ITR"],
  },
  {
    id: "ln-mortgage",
    categoryId: "loans",
    name: "Loan Against Property",
    summary: "Unlock property equity while retaining ownership.",
    pricing: { model: "quote" },
    documents: ["Title deed", "Valuation report", "PAN", "Aadhaar", "Income proof"],
  },
];

export const COMPLIANCE = {
  tsRera: {
    label: "TS-RERA Agent No.",
    value: "Add licensed agent number",
    note: "Verify agent registration on the Telangana RERA portal before transacting.",
  },
  irdai: {
    label: "IRDAI / POSP Licence",
    value: "Add licensed POSP code",
    note: "Insurance advice is provided through an IRDAI-licensed POSP.",
  },
  rbi: {
    label: "RBI Disclaimer",
    value: "Final approval rests with the lender",
    note: "Loan eligibility estimates are indicative; banks and NBFCs make the final decision.",
  },
  dpdp: {
    label: "Data Privacy (DPDP)",
    value: "Your data is used only to service your request",
    note: "Documents are stored securely and shared only with the partner handling your case.",
  },
  labour: {
    label: "Service Liability",
    value: "Digital waiver required for high-risk work",
    note: "High-risk installations are carried out by vetted partners under a signed waiver.",
  },
} as const;
