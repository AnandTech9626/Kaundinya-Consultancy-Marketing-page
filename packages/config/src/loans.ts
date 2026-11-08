export const LOAN_PRODUCTS = [
  {
    id: "home",
    name: "Home loan",
    tagline: "Purchase, construction or plot funding",
    description:
      "Guidance for salaried and self-employed borrowers buying a home, constructing on a plot or transferring an existing home loan.",
    whoFor: [
      "First-time home buyers",
      "Construction on an owned plot",
      "Balance transfer or top-up",
    ],
    highlights: [
      "Eligibility and FOIR review",
      "Lender comparison across banks and NBFCs",
      "Sanction and disbursal coordination",
    ],
    documents: [
      "PAN and Aadhaar",
      "3 months payslips or 2 years ITR",
      "6 months bank statement",
      "Property sale agreement or allotment letter",
      "Employment or business proof",
    ],
  },
  {
    id: "personal",
    name: "Personal loan",
    tagline: "Unsecured funding for planned expenses",
    description:
      "Short-tenure unsecured loans reviewed for actual repayment capacity, processing fees and foreclosure terms.",
    whoFor: [
      "Medical or education expenses",
      "Wedding or travel",
      "Temporary cash-flow gap",
    ],
    highlights: [
      "Repayment capacity check",
      "Processing fee and insurance add-on review",
      "Foreclosure and part-payment terms",
    ],
    documents: [
      "PAN and Aadhaar",
      "3 months payslips",
      "3 months bank statement",
      "Employment proof",
    ],
  },
  {
    id: "business",
    name: "Business loan",
    tagline: "Working capital and expansion funding",
    description:
      "Secured and unsecured business funding reviewed against turnover, GST filings and existing obligations.",
    whoFor: [
      "Working capital cycles",
      "Equipment or inventory purchase",
      "Branch or capacity expansion",
    ],
    highlights: [
      "GST and turnover review",
      "Cash-flow based eligibility",
      "Secured vs unsecured comparison",
    ],
    documents: [
      "GSTIN and business proof",
      "2 years ITR and P&L",
      "12 months bank statement",
      "Owner KYC",
    ],
  },
  {
    id: "property",
    name: "Loan against property",
    tagline: "Unlock equity without selling",
    description:
      "Mortgage funding against residential or commercial property, reviewed for valuation, title clarity and repayment capacity.",
    whoFor: [
      "Business expansion without selling property",
      "Consolidating higher-cost debt",
      "Large planned expenses",
    ],
    highlights: [
      "Title and valuation coordination",
      "LTV and FOIR review",
      "Lowest-rate lender shortlist",
    ],
    documents: [
      "Title deed and encumbrance certificate",
      "Property tax receipts",
      "PAN and Aadhaar",
      "Income proof and bank statement",
      "Valuation report",
    ],
  },
] as const;

export const LOAN_HELP = [
  {
    title: "Eligibility review",
    description:
      "Income, obligations and credit profile reviewed before you approach a lender.",
  },
  {
    title: "Lender comparison",
    description:
      "Rates, fees, foreclosure terms and service quality compared side by side.",
  },
  {
    title: "Documentation help",
    description:
      "A clear checklist for salaried, self-employed and business applicants.",
  },
  {
    title: "Sanction to disbursal",
    description:
      "We coordinate queries, sanction letters and disbursal milestones.",
  },
] as const;

export const LOAN_FACTORS = [
  {
    title: "Credit score",
    description:
      "A cleaner repayment history usually means a better rate and fewer conditions.",
  },
  {
    title: "FOIR",
    description:
      "Fixed obligation to income ratio decides how much of your monthly income can service a new EMI.",
  },
  {
    title: "Income stability",
    description:
      "Salary credits, ITR continuity and business vintage all influence lender confidence.",
  },
  {
    title: "Collateral",
    description:
      "Secured loans can offer lower rates and longer tenures, but put an asset at risk.",
  },
  {
    title: "Documents",
    description:
      "Complete, consistent documents reduce queries and speed up sanction.",
  },
] as const;

export const LOAN_PROCESS_STEPS = [
  {
    title: "Consultation",
    description: "Understand the requirement, amount and timeline.",
  },
  {
    title: "Eligibility",
    description: "Review income, obligations and credit profile.",
  },
  {
    title: "Documents",
    description: "Prepare a lender-ready document set.",
  },
  {
    title: "Lender match",
    description: "Compare rate, fees and terms across lenders.",
  },
  {
    title: "Sanction",
    description: "Coordinate verification and sanction conditions.",
  },
  {
    title: "Disbursal",
    description: "Track agreement, disbursal and repayment schedule.",
  },
] as const;

export const LOAN_SUPPORT_TOPICS = [
  {
    id: "eligibility",
    title: "Eligibility review",
    description:
      "Check how much you may qualify for before applying with multiple lenders.",
  },
  {
    id: "documents",
    title: "Document help",
    description:
      "Get the right payslips, ITR, bank statements and property papers ready.",
  },
  {
    id: "lender",
    title: "Lender coordination",
    description:
      "We shortlist lenders and coordinate queries, verification and terms.",
  },
  {
    id: "sanction",
    title: "Sanction & disbursal",
    description:
      "Track sanction conditions, agreement signing and disbursal milestones.",
  },
] as const;

export const LOAN_SUPPORT_STEPS = [
  {
    title: "Raise the request",
    description:
      "Choose the help you need and share the loan type and amount. No application is submitted yet.",
  },
  {
    title: "Get a checklist",
    description:
      "A consultant reviews the case and sends the exact documents required.",
  },
  {
    title: "Coordinate with lenders",
    description:
      "We compare options, prepare the file and respond to lender queries.",
  },
  {
    title: "Close the loop",
    description:
      "You get clear status updates until sanction and disbursal are complete.",
  },
] as const;

export const LOAN_SUPPORT_DOCUMENTS = [
  "PAN and Aadhaar",
  "Latest salary slips or ITR",
  "Bank statements",
  "Employment or business proof",
  "Property papers for secured loans",
  "Existing loan statements, if any",
] as const;

export const LOAN_GUIDE = [
  "Borrow for a defined need and keep the EMI within a comfortable share of income.",
  "Compare the total cost, not just the interest rate: processing fee, insurance and foreclosure charges matter.",
  "A longer tenure lowers the EMI but increases total interest.",
  "Avoid multiple simultaneous applications; each enquiry can affect your credit score.",
] as const;
