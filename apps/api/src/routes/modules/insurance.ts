import { Hono } from "hono";
import {
  HospitalModel,
  InsurancePlanModel,
  PolicyRecordModel,
} from "../../db/models/Insurance.js";
import { adminAuthMiddleware, authMiddleware } from "../../middleware/auth.js";
import { errorResponse, successResponse } from "../../utils/response.js";

export const insuranceRoutes = new Hono();

// GET /api/insurance/plans
insuranceRoutes.get("/insurance/plans", async (c) => {
  try {
    const type = c.req.query("type");
    const familyOption = c.req.query("familyOption");

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (familyOption) query.familyOption = familyOption;

    let plans = await InsurancePlanModel.find(query);

    // If database has no plans yet, return default curated catalog
    if (plans.length === 0) {
      plans = await InsurancePlanModel.insertMany([
        {
          id: "plan-health-1",
          type: "health",
          insurer: "Star Health",
          name: "Family Health Optima",
          sumInsured: 1000000,
          premium: 14500,
          tenureYears: 1,
          features: ["Cashless in 14000+ hospitals", "No room rent cap", "Free health checkup"],
          cashlessNetwork: true,
          familyOption: "family",
        },
        {
          id: "plan-health-2",
          type: "health",
          insurer: "HDFC ERGO",
          name: "Optima Secure",
          sumInsured: 1500000,
          premium: 18200,
          tenureYears: 1,
          features: ["2X coverage from day 1", "Global cover", "Zero deduction on consumables"],
          cashlessNetwork: true,
          familyOption: "family",
        },
        {
          id: "plan-life-1",
          type: "life",
          insurer: "HDFC Life",
          name: "Click 2 Protect Super",
          sumInsured: 10000000,
          premium: 9800,
          tenureYears: 30,
          features: ["Terminal illness benefit", "Waiver of premium", "Return of premium option"],
        },
        {
          id: "plan-motor-1",
          type: "motor",
          insurer: "ICICI Lombard",
          name: "Comprehensive Car Protection",
          sumInsured: 850000,
          premium: 12400,
          tenureYears: 1,
          features: ["Zero depreciation", "24x7 Roadside assistance", "Engine protect cover"],
          cashlessNetwork: true,
        },
      ]);
    }

    return successResponse(c, plans);
  } catch (err) {
    console.error("[Get Plans Error]", err);
    return errorResponse(c, "Failed to fetch plans.", 500);
  }
});

// POST /api/insurance/needs-analysis
insuranceRoutes.post("/insurance/needs-analysis", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const annualIncome = Number(body.annualIncome) || 800000;
    const dependents = Number(body.dependents) || 2;
    const liabilities = Number(body.liabilities) || 0;

    // Financial rule of thumb: 15x income + liabilities + dependents buffer
    const recommendedCoverage = Math.max(
      annualIncome * 15 + liabilities + dependents * 500000,
      5000000
    );
    const estimatedPremium = Math.round(recommendedCoverage * 0.001);

    return successResponse(c, {
      recommendedCoverage,
      estimatedPremium,
      basis: `Estimated based on 15x annual income (₹${annualIncome.toLocaleString()}) + liabilities with ${dependents} dependents.`,
    });
  } catch (err) {
    console.error("[Needs Analysis Error]", err);
    return errorResponse(c, "Failed to calculate needs.", 500);
  }
});

// GET /api/insurance/network-hospitals
insuranceRoutes.get("/insurance/network-hospitals", async (c) => {
  const pincode = c.req.query("pincode");
  const query: Record<string, unknown> = {};
  if (pincode) query.pincode = pincode;

  let hospitals = await HospitalModel.find(query);
  if (hospitals.length === 0) {
    hospitals = await HospitalModel.insertMany([
      {
        id: "hosp-1",
        name: "Apollo Hospitals",
        address: "Jubilee Hills, Road No. 72, Hyderabad",
        pincode: "500033",
        cashless: true,
        distanceKm: 4.2,
      },
      {
        id: "hosp-2",
        name: "KIMS Hospitals",
        address: "Minister Road, Secunderabad",
        pincode: "500003",
        cashless: true,
        distanceKm: 6.8,
      },
      {
        id: "hosp-3",
        name: "Yashoda Hospitals",
        address: "Hitec City, Madhapur, Hyderabad",
        pincode: "500081",
        cashless: true,
        distanceKm: 2.1,
      },
    ]);
  }

  return successResponse(c, hospitals);
});

// POST /api/insurance/motor/vehicle-lookup (Smart Mock Vahan RC)
insuranceRoutes.post("/insurance/motor/vehicle-lookup", authMiddleware, async (c) => {
  const body = await c.req.json();
  const regNo = String(body.registrationNumber || "").toUpperCase().replace(/\s+/g, "");

  if (!regNo || regNo.length < 6) {
    return errorResponse(c, "Valid registration number required.", 422);
  }

  // Smart simulated Vahan response for any vehicle plate
  return successResponse(c, {
    registrationNumber: regNo,
    make: "Hyundai",
    model: "Creta SX(O) 1.5",
    fuelType: "Petrol",
    year: 2022,
    engineCC: 1497,
  });
});

// POST /api/insurance/motor/quote
insuranceRoutes.post("/insurance/motor/quote", authMiddleware, async (c) => {
  const body = await c.req.json();
  const vehicle = body.vehicle || {
    registrationNumber: "TS09EA1234",
    make: "Hyundai",
    model: "Creta",
    year: 2022,
  };

  const idv = 950000;
  const basePremium = Math.round(idv * 0.025);

  return successResponse(c, {
    plan: {
      id: "plan-motor-creta",
      type: "motor",
      insurer: "ICICI Lombard",
      name: "Comprehensive Motor Package",
      sumInsured: idv,
      premium: basePremium,
      tenureYears: 1,
      features: ["Zero Dep", "Engine Protect", "Return to Invoice"],
    },
    vehicle,
    addOns: ["Zero Depreciation", "24x7 Roadside Assistance"],
    totalPremium: basePremium + 2800,
  });
});

// POST /api/insurance/motor/checkout
insuranceRoutes.post("/insurance/motor/checkout", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const policyId = `pol-${Date.now()}`;
  const renewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const created = await PolicyRecordModel.create({
    id: policyId,
    mobile: user.mobile,
    type: "Motor",
    provider: "ICICI Lombard",
    policyNumber: `POL-MOT-${Math.floor(100000 + Math.random() * 900000)}`,
    coverAmount: 950000,
    premium: 15200,
    renewalDate,
    status: "active",
    holder: user.name,
    validFrom: new Date().toISOString().slice(0, 10),
  });

  return successResponse(c, created, "Policy issued successfully", 201);
});

// GET /api/policies (Policy Vault)
insuranceRoutes.get("/policies", authMiddleware, async (c) => {
  const user = c.get("user");
  const policies = await PolicyRecordModel.find({ mobile: user.mobile }).sort({
    createdAt: -1,
  });
  return successResponse(c, policies);
});

// GET /api/policies/:id
insuranceRoutes.get("/policies/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const policy = await PolicyRecordModel.findOne({ id, mobile: user.mobile });
  if (!policy) return errorResponse(c, "Policy not found.", 404);
  return successResponse(c, policy);
});

// GET /api/policies/:id/download
insuranceRoutes.get("/policies/:id/download", authMiddleware, async (c) => {
  const id = c.req.param("id");
  return successResponse(c, {
    fileName: `Kaundinya_Policy_${id}.pdf`,
    downloadUrl: `https://kaundinyaconsultancy.com/vault/policies/${id}.pdf`,
  });
});

// Admin Renewals
export const adminInsuranceRoutes = new Hono();
adminInsuranceRoutes.use("*", adminAuthMiddleware);

adminInsuranceRoutes.get("/renewals", async (c) => {
  const policies = await PolicyRecordModel.find().sort({ renewalDate: 1 });
  const renewals = policies.map((p) => ({
    id: p.id,
    clientName: p.holder || "Client",
    provider: p.provider,
    policyType: p.type,
    policyNumber: p.policyNumber,
    renewalDate: p.renewalDate,
    premium: p.premium,
    reminderSent: false,
  }));
  return successResponse(c, renewals);
});

adminInsuranceRoutes.post("/renewals/:id/remind", async (c) => {
  const id = c.req.param("id");
  return successResponse(c, { id, reminderSent: true }, "Reminder sent to client");
});
