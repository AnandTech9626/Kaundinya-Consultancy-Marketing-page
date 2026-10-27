import type { ServiceCategory } from "./types";

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
