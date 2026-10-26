import React, { useState } from "react";
import { Building2, ShieldCheck, Wrench, Coins, ArrowRight, CheckCircle2 } from "lucide-react";

interface ServiceTab {
  id: string;
  name: string;
  icon: any;
  headline: string;
  description: string;
  image: string;
  link: string;
  deliverables: string[];
}

const TABS: ServiceTab[] = [
  {
    id: "real-estate",
    name: "Real Estate",
    icon: Building2,
    headline: "Property Rentals & Purchase Guidance Without High-Pressure Tactics",
    description: "Whether you are looking to rent a comfortable home, purchase your ideal property, or sell an asset in Hyderabad, we assist with market comparisons, agreement drafting, and tenant coordination.",
    image: "/images/real_estate.webp",
    link: "/services/real-estate",
    deliverables: [
      "Verified residential & commercial rentals",
      "Property buying evaluation & price benchmarking",
      "Drafting legal rental agreements & tenant verification",
      "Filtered buyer coordination for property sellers",
    ],
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: ShieldCheck,
    headline: "Objective Policy Reviews to Protect Your Family and Assets",
    description: "Confused by fine print and waiting periods? We help you evaluate life, term, comprehensive health, motor, and property insurance plans tailored to your real circumstances.",
    image: "/images/insurance.webp",
    link: "/services/insurance",
    deliverables: [
      "Adequate sum assured & term life calculation",
      "Health insurance room rent limit & pre-existing review",
      "Two-wheeler & four-wheeler zero depreciation cover",
      "Residential & commercial property protection",
    ],
  },
  {
    id: "home-services",
    name: "Home Services",
    icon: Wrench,
    headline: "Balcony Pigeon Nets, Invisible Grills & Appliance Servicing",
    description: "Eliminate the headache of dealing with unverified freelance technicians. We coordinate vetted professionals for pigeon nets, invisible grills, AC maintenance, and civic documentation in Hyderabad.",
    image: "/images/home_services.webp",
    link: "/services/property-home-services",
    deliverables: [
      "UV-stabilized copolymer pigeon nets installation",
      "316 marine-grade stainless steel invisible grills",
      "Split AC jet cleaning, gas charging & compressor testing",
      "Aadhaar & Voter ID address update coordination",
    ],
  },
  {
    id: "loans",
    name: "Loans",
    icon: Coins,
    headline: "Transparent Loan Eligibility & Financial Paperwork Support",
    description: "Compare lending options, calculate realistic borrowing capacities, and organize your documentation for home, personal, business, or mortgage loans with clear, factual advice.",
    image: "/images/loans.webp",
    link: "/services/loans",
    deliverables: [
      "Home loans for apartment purchase & construction",
      "Loan Against Property (Mortgage) at competitive terms",
      "Personal loans with transparent APR calculations",
      "MSME business loans & working capital credit lines",
    ],
  },
];

export default function ServiceFinder() {
  const [activeTab, setActiveTab] = useState<string>("real-estate");
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="bg-white rounded-3xl border border-border-subtle shadow-xl overflow-hidden">
      
      {/* Top Tab Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-ivory border-b border-border-subtle">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2.5 py-4 px-4 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                isActive
                  ? "bg-white text-charcoal border-gold shadow-sm"
                  : "text-muted hover:text-charcoal border-transparent hover:bg-white/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-muted"}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Text and Deliverables */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight leading-snug">
              {current.headline}
            </h3>

            <p className="text-sm sm:text-base text-muted leading-relaxed">
              {current.description}
            </p>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal">
                What We Coordinate For You:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-charcoal-light">
                {current.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-border-subtle/60">
              <a
                href={current.link}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-charcoal bg-gold hover:bg-gold-hover shadow-sm transition-all duration-150"
              >
                <span>Full Service Guide</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Realistic Photography Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-border-subtle shadow-lg group">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
