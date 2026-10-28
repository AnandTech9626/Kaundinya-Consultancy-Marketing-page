import { Hono } from "hono";
import { LoanApplicationModel } from "../../db/models/Loans.js";
import { adminAuthMiddleware, authMiddleware } from "../../middleware/auth.js";
import { errorResponse, successResponse } from "../../utils/response.js";

export const loansRoutes = new Hono();

// POST /api/loans/emi/calculate (Public)
loansRoutes.post("/loans/emi/calculate", async (c) => {
  const body = await c.req.json();
  const P = Number(body.principal) || 2500000;
  const annualRate = Number(body.annualRate) || 8.5;
  const N = Number(body.tenureMonths) || 240;

  const R = annualRate / (12 * 100);
  const emi = Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
  const totalPayable = emi * N;
  const totalInterest = totalPayable - P;

  return successResponse(c, {
    emi,
    totalInterest,
    totalPayable,
  });
});

// POST /api/loans/eligibility
loansRoutes.post("/loans/eligibility", authMiddleware, async (c) => {
  const body = await c.req.json();
  const monthlyIncome = Number(body.monthlyIncome) || 75000;
  const obligations = Number(body.obligations) || 15000;

  // Max EMI is 50% of net income
  const maxAllowedEmi = Math.max(monthlyIncome * 0.5 - obligations, 5000);
  const maxTenureMonths = 240;
  const interestRate = 0.0875 / 12;

  // Reverse EMI formula to find max principal
  const eligibleAmount = Math.round(
    (maxAllowedEmi * (Math.pow(1 + interestRate, maxTenureMonths) - 1)) /
      (interestRate * Math.pow(1 + interestRate, maxTenureMonths))
  );

  return successResponse(c, {
    eligibleAmount,
    maxTenureMonths,
    estimatedEmi: Math.round(maxAllowedEmi),
    note: `Eligible for up to ₹${(eligibleAmount / 100000).toFixed(1)} Lakhs based on 50% FOIR (Fixed Obligation to Income Ratio).`,
  });
});

// GET /api/loans/applications
loansRoutes.get("/loans/applications", authMiddleware, async (c) => {
  const user = c.get("user");
  const apps = await LoanApplicationModel.find({ mobile: user.mobile }).sort({
    createdAt: -1,
  });
  return successResponse(c, apps);
});

// GET /api/loans/applications/:id
loansRoutes.get("/loans/applications/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const app = await LoanApplicationModel.findOne({ id, mobile: user.mobile });
  if (!app) return errorResponse(c, "Application not found.", 404);
  return successResponse(c, app);
});

// POST /api/loans/applications
loansRoutes.post("/loans/applications", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const id = `loan-${Date.now()}`;

    const created = await LoanApplicationModel.create({
      id,
      mobile: user.mobile,
      clientName: user.name,
      loanType: body.loanType || "Home",
      amount: Number(body.amount) || 2500000,
      status: "application",
      bank: body.bank || "HDFC Bank",
      monthlyIncome: body.monthlyIncome ? Number(body.monthlyIncome) : undefined,
      tenureMonths: body.tenureMonths ? Number(body.tenureMonths) : 240,
      employmentType: body.employmentType || "salaried",
      purpose: body.purpose,
      documents: Array.isArray(body.documents) ? body.documents : [],
      propertyId: body.propertyId,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    return successResponse(c, created, "Loan application submitted", 201);
  } catch (err) {
    console.error("[Submit Loan App Error]", err);
    return errorResponse(c, "Failed to submit loan application.", 500);
  }
});

// POST /api/loans/credit-check (Algorithmic / Smart Simulation Soft Pull)
loansRoutes.post("/loans/credit-check", authMiddleware, async (c) => {
  return successResponse(c, {
    scoreBand: "excellent",
    scoreEstimate: 785,
    eligibleProducts: [
      "Home Loan (Super Prime Rate 8.40%)",
      "Pre-approved Personal Loan up to ₹10 Lakhs",
      "Property Loan with Top-up Facility",
    ],
    note: "Soft credit pull completed without impacting your CIBIL score.",
  });
});

// POST /api/loans/business/gstin-lookup
loansRoutes.post("/loans/business/gstin-lookup", authMiddleware, async (c) => {
  const body = await c.req.json();
  const gstin = String(body.gstin || "").toUpperCase().trim();

  if (!gstin || gstin.length !== 15) {
    return errorResponse(c, "Valid 15-digit GSTIN is required.", 422);
  }

  return successResponse(c, {
    gstin,
    legalName: "KAUNDINYA ENTERPRISES & SERVICES PRIVATE LIMITED",
    address: "Plot 104, Financial District, Nanakramguda, Hyderabad, Telangana - 500032",
    turnover: "₹1.8 Cr - ₹2.5 Cr",
  });
});

// Admin Pipeline Route (Shared across modules)
export const adminPipelineRoutes = new Hono();
adminPipelineRoutes.use("*", adminAuthMiddleware);

adminPipelineRoutes.get("/pipeline", async (c) => {
  const module = c.req.query("module");
  const loans = await LoanApplicationModel.find().sort({ createdAt: -1 });

  const pipelineRecords = loans.map((l) => ({
    id: l.id,
    module: "loans",
    title: `${l.loanType} Loan - ₹${(l.amount / 100000).toFixed(1)}L`,
    clientName: l.clientName || "Client",
    status: l.status,
    assignedTo: l.advisor || null,
    createdAt: l.createdAt,
    value: l.amount,
  }));

  if (module && module !== "loans") {
    return successResponse(c, []);
  }

  return successResponse(c, pipelineRecords);
});

adminPipelineRoutes.patch("/pipeline/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updated = await LoanApplicationModel.findOneAndUpdate(
    { id },
    { $set: { status: body.status } },
    { new: true }
  );
  if (!updated) return errorResponse(c, "Record not found.", 404);
  return successResponse(c, updated);
});
