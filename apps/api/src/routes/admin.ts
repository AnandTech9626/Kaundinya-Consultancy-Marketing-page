import { Hono } from "hono";
import { config } from "../config.js";
import { EnquiryModel } from "../db/models/Enquiry.js";
import { ServiceRequestModel } from "../db/models/ServiceRequest.js";
import { StaffModel } from "../db/models/Staff.js";
import { UserModel } from "../db/models/User.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import { hashPassword } from "../services/password.js";
import { ensureStaffSeeded } from "../services/staff.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const adminGeneralRoutes = new Hono();
adminGeneralRoutes.use("*", adminAuthMiddleware);

// GET /api/admin/stats
adminGeneralRoutes.get("/stats", async (c) => {
  try {
    const [enquiries, requests] = await Promise.all([
      EnquiryModel.find(),
      ServiceRequestModel.find(),
    ]);

    const totalEnquiries = enquiries.length;
    const newEnquiries = enquiries.filter((e) => e.status === "new").length;
    const converted = enquiries.filter((e) => e.status === "converted").length;

    const openRequests = requests.filter(
      (r) => r.status === "new" || r.status === "in_progress"
    ).length;
    const completedRequests = requests.filter((r) => r.status === "completed").length;

    // Service category breakdown
    const byServiceMap = new Map<string, number>();
    enquiries.forEach((e) => {
      byServiceMap.set(e.serviceCategory, (byServiceMap.get(e.serviceCategory) ?? 0) + 1);
    });

    const byService = Array.from(byServiceMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // Status breakdown
    const statuses = ["new", "contacted", "qualified", "converted", "lost"] as const;
    const byStatus = statuses.map((status) => ({
      status,
      count: enquiries.filter((e) => e.status === status).length,
    }));

    return successResponse(c, {
      totalEnquiries,
      newEnquiries,
      converted,
      openRequests,
      completedRequests,
      byService,
      byStatus,
    });
  } catch (err) {
    console.error("[Get Admin Stats Error]", err);
    return errorResponse(c, "Failed to calculate admin stats.", 500);
  }
});

// GET /api/admin/clients
adminGeneralRoutes.get("/clients", async (c) => {
  try {
    const users = await UserModel.find({ role: "client" }).sort({ createdAt: -1 });

    // Count requests per client
    const requestCounts = await ServiceRequestModel.aggregate([
      { $group: { _id: "$mobile", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    requestCounts.forEach((rc) => countMap.set(rc._id, rc.count));

    const clientRecords = users.map((u, idx) => ({
      id: `cl-${idx + 1}`,
      name: u.name,
      email: u.email || "",
      mobile: u.mobile,
      joinedAt: u.joinedAt || new Date().toISOString().slice(0, 10),
      requestsCount: countMap.get(u.mobile) ?? 0,
      verified: u.verified,
    }));

    return successResponse(c, clientRecords);
  } catch (err) {
    console.error("[Get Admin Clients Error]", err);
    return errorResponse(c, "Failed to fetch clients.", 500);
  }
});

// GET /api/admin/staff
adminGeneralRoutes.get("/staff", async (c) => {
  try {
    await ensureStaffSeeded();
    const staff = await StaffModel.find();
    return successResponse(c, staff);
  } catch (err) {
    console.error("[Get Admin Staff Error]", err);
    return errorResponse(c, "Failed to fetch staff members.", 500);
  }
});

// POST /api/admin/staff
adminGeneralRoutes.post("/staff", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body) return errorResponse(c, "Invalid request body.", 422);

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = body.role === "admin" ? "admin" : "agent";

    if (name.length < 2) {
      return errorResponse(c, "Enter a valid name.", 422, { name: "Name is too short." });
    }
    if (!email) {
      return errorResponse(c, "Enter a valid email address.", 422, {
        email: "Email is required.",
      });
    }

    const existing = await StaffModel.findOne({ email });
    if (existing) {
      return errorResponse(c, "A staff member with this email already exists.", 409);
    }

    const created = await StaffModel.create({
      id: `st-${Date.now()}`,
      name,
      email,
      role,
      active: true,
      passwordHash: hashPassword(
        String(body.password || config.staffDefaultPassword)
      ),
    });

    return successResponse(
      c,
      {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        active: created.active,
      },
      undefined,
      201
    );
  } catch (err) {
    console.error("[Create Staff Error]", err);
    return errorResponse(c, "Failed to create staff member.", 500);
  }
});

// PATCH /api/admin/staff/:id
adminGeneralRoutes.patch("/staff/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    if (!body) return errorResponse(c, "Invalid request body.", 422);

    const update: Record<string, unknown> = {};
    if (typeof body.name === "string") update.name = body.name.trim();
    if (typeof body.email === "string") update.email = body.email.trim().toLowerCase();
    if (body.role === "admin" || body.role === "agent") update.role = body.role;
    if (typeof body.active === "boolean") update.active = body.active;
    if (typeof body.password === "string" && body.password.length >= 4) {
      update.passwordHash = hashPassword(body.password);
    }

    const updated = await StaffModel.findOneAndUpdate(
      { id },
      { $set: update },
      { new: true }
    );

    if (!updated) return errorResponse(c, "Staff member not found.", 404);
    return successResponse(c, updated);
  } catch (err) {
    console.error("[Update Staff Error]", err);
    return errorResponse(c, "Failed to update staff member.", 500);
  }
});
