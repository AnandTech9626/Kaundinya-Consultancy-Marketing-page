export const INSURANCE_COVERAGE_TYPES = [
  {
    id: "life",
    name: "Life & Term",
    tagline: "Protect the people who depend on your income",
    description:
      "Pure term cover that replaces income and clears liabilities if you are not around.",
    review: [
      "Income replacement calculation",
      "Pure term vs endowment analysis",
      "Rider suitability guidance",
    ],
  },
  {
    id: "health",
    name: "Health & Family Floater",
    tagline: "Cover hospital bills without surprise exclusions",
    description:
      "Individual and family floaters reviewed for room-rent limits, waiting periods and restoration.",
    review: [
      "Cashless network evaluation",
      "Room-rent and co-pay clarity",
      "Restoration and no-claim bonus",
    ],
  },
  {
    id: "motor",
    name: "Motor",
    tagline: "Renewals and claims without the runaround",
    description:
      "Two-wheeler and car cover reviewed for IDV, zero depreciation and practical roadside support.",
    review: [
      "IDV and premium review",
      "Add-on suitability",
      "NCB transfer and renewal timing",
    ],
  },
  {
    id: "property",
    name: "Property",
    tagline: "Safeguard the home and assets you have built",
    description:
      "Residential and commercial property cover against fire, flooding, electrical events and burglary.",
    review: [
      "Structure vs contents valuation",
      "Burglary and electrical riders",
      "Owner vs tenant cover",
    ],
  },
] as const;

export const INSURANCE_HELP = [
  {
    title: "Needs analysis",
    description:
      "We start with your income, dependents and liabilities before talking about products.",
  },
  {
    title: "Plan comparison",
    description:
      "Side-by-side reading of coverage, exclusions, sub-limits and claim settlement records.",
  },
  {
    title: "Claim assistance",
    description:
      "Document checklists, cashless coordination and follow-up support when you need to claim.",
  },
  {
    title: "Renewal reminders",
    description:
      "We flag renewals early so cover never lapses and no-claim benefits stay intact.",
  },
] as const;

export const HEALTH_FINE_PRINT = [
  {
    title: "Room-rent limits",
    description:
      "A single private room cap can change the entire settlement. We check the percentage and associated costs.",
  },
  {
    title: "Waiting periods",
    description:
      "Pre-existing conditions, specific diseases and maternity cover usually have separate waiting periods.",
  },
  {
    title: "Co-pay clauses",
    description:
      "A co-pay means you pay a fixed share of every claim. We explain when it applies and how much it costs.",
  },
  {
    title: "Restoration benefit",
    description:
      "Unlimited restoration sounds strong, but the trigger and refill limits matter. We read the wording.",
  },
] as const;

export const HEALTH_CLAIM_STEPS = [
  {
    title: "Inform the hospital",
    description:
      "Share your policy details at the insurance desk before admission for cashless authorization.",
  },
  {
    title: "Submit documents",
    description:
      "ID, policy number, doctor's advice and pre-authorization form go to the insurer's TPA.",
  },
  {
    title: "Track approval",
    description:
      "We follow up on queries and keep you updated until the authorization is issued.",
  },
  {
    title: "Settle and collect",
    description:
      "For reimbursement, collect itemised bills, discharge summary and payment receipts.",
  },
] as const;

export const HEALTH_DOCUMENTS = [
  "Policy number and member ID",
  "Government photo ID",
  "Doctor's admission advice",
  "Pre-authorization form",
  "Discharge summary and itemised bill",
  "Payment receipts and investigation reports",
] as const;

export const MOTOR_RENEWAL_CHECKS = [
  {
    title: "IDV",
    description:
      "Insured declared value should reflect the current market value, not the showroom price.",
  },
  {
    title: "Zero depreciation",
    description:
      "Useful on newer vehicles where plastic and metal parts are replaced often.",
  },
  {
    title: "Engine protect",
    description:
      "Relevant for water-logging and hydrostatic lock risks during Hyderabad monsoons.",
  },
  {
    title: "No-claim bonus",
    description:
      "Confirm the accumulated NCB is carried forward when you switch insurers.",
  },
  {
    title: "Roadside assistance",
    description:
      "Check the towing limit, helpline hours and network coverage in your area.",
  },
] as const;

export const MOTOR_CLAIM_STEPS = [
  {
    title: "Move to safety",
    description: "Shift the vehicle off traffic and note the location and time.",
  },
  {
    title: "Inform the insurer",
    description:
      "Call the helpline or use the app to register the claim before repairs begin.",
  },
  {
    title: "Document the damage",
    description:
      "Photograph the vehicle, registration, driving licence and any third-party details.",
  },
  {
    title: "Use a network garage",
    description:
      "Cashless repairs work best at an approved garage. Keep the survey approval.",
  },
] as const;

export const INSURANCE_SUPPORT_TOPICS = [
  {
    id: "claim",
    title: "Claim assistance",
    description:
      "Health, motor, life or property claims — we help with documents, coordination and follow-up.",
  },
  {
    id: "renewal",
    title: "Renewal help",
    description:
      "Review the renewal quote, confirm benefits and avoid a lapse in cover.",
  },
  {
    id: "documents",
    title: "Document help",
    description:
      "KYC, medicals, vehicle papers or claim forms — get a clear checklist before you submit.",
  },
  {
    id: "guidance",
    title: "General guidance",
    description:
      "Not sure what you need? Start here and we will point you in the right direction.",
  },
] as const;

export const CLAIM_SUPPORT_STEPS = [
  {
    title: "Raise the request",
    description:
      "Choose the claim type and share the policy or vehicle reference. No documents are needed yet.",
  },
  {
    title: "Get a checklist",
    description:
      "A consultant reviews the case and sends the exact documents and forms required.",
  },
  {
    title: "Coordinate with the insurer",
    description:
      "We help you file, respond to queries and track the survey or authorization.",
  },
  {
    title: "Close the loop",
    description:
      "You get a clear status until the claim is settled or the renewal is completed.",
  },
] as const;

export const CLAIM_DOCUMENTS = [
  "Policy number or vehicle registration",
  "Government photo ID",
  "Incident date, location and description",
  "Hospital or garage bills and reports",
  "Any insurer correspondence or query letter",
] as const;

export const LIFE_GUIDE = [
  "Cover should replace income, clear loans and fund dependents' goals.",
  "Pure term plans usually deliver the highest cover for the lowest premium.",
  "Riders are useful only when the base cover is already adequate.",
  "Disclose health history accurately; non-disclosure is the biggest claim risk.",
] as const;

export const PROPERTY_GUIDE = [
  "Insure the structure and contents separately so the sum insured is realistic.",
  "Check whether floods, storms and electrical breakdown are included or optional.",
  "Tenants need contents cover; owners need structure cover.",
  "Revalue the property every few years as construction costs rise.",
] as const;
