import { Hono } from "hono";
import { EnquiryModel } from "../db/models/Enquiry.js";
import { ServiceRequestModel } from "../db/models/ServiceRequest.js";
import { StaffModel } from "../db/models/Staff.js";
import { UserModel } from "../db/models/User.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
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
    let staff = await StaffModel.find();

    // If no staff exists, seed initial staff members from CRM defaults
    if (staff.length === 0) {
      staff = await StaffModel.insertMany([
        {
          id: "st-1",
          name: "Kaundinya Admin",
          email: "admin@kaundinya.com",
          role: "admin",
          active: true,
        },
        {
          id: "st-2",
          name: "Harika Garre",
          email: "harika@kaundinya.com",
          role: "agent",
          active: true,
        },
        {
          id: "st-3",
          name: "Suresh Varma",
          email: "suresh@kaundinya.com",
          role: "agent",
          active: true,
        },
      ]);
    }

    return successResponse(c, staff);
  } catch (err) {
    console.error("[Get Admin Staff Error]", err);
    return errorResponse(c, "Failed to fetch staff members.", 500);
  }
});
