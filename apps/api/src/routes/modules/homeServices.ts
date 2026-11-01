import { Hono } from "hono";
import {
  DocumentRecordModel,
  InteriorConsultationModel,
  JobRecordModel,
  MeasurementBookingModel,
  PrintJobModel,
} from "../../db/models/HomeServices.js";
import { StaffModel } from "../../db/models/Staff.js";
import { adminAuthMiddleware, authMiddleware } from "../../middleware/auth.js";
import { errorResponse, successResponse } from "../../utils/response.js";

export const homeServicesRoutes = new Hono();

// GET /api/home-services/measurements
homeServicesRoutes.get("/home-services/measurements", authMiddleware, async (c) => {
  const user = c.get("user");
  const items = await MeasurementBookingModel.find({ mobile: user.mobile }).sort({
    createdAt: -1,
  });
  return successResponse(c, items);
});

// POST /api/home-services/measurements
homeServicesRoutes.post("/home-services/measurements", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const id = `meas-${Date.now()}`;

    const created = await MeasurementBookingModel.create({
      id,
      mobile: user.mobile,
      serviceId: body.serviceId || "srv-meas",
      serviceName: body.serviceName || "Measurement Booking",
      address: body.address || "Hyderabad",
      pincode: body.pincode || "500001",
      date: body.date || new Date().toISOString().slice(0, 10),
      slot: body.slot || "10:00 AM - 1:00 PM",
      status: "requested",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    return successResponse(c, created, undefined, 201);
  } catch (err) {
    console.error("[Book Measurement Error]", err);
    return errorResponse(c, "Failed to book measurement.", 500);
  }
});

// GET /api/jobs
homeServicesRoutes.get("/jobs", authMiddleware, async (c) => {
  const user = c.get("user");
  const jobs = await JobRecordModel.find({ mobile: user.mobile }).sort({ createdAt: -1 });
  return successResponse(c, jobs);
});

// GET /api/jobs/:id
homeServicesRoutes.get("/jobs/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const job = await JobRecordModel.findOne({ id, mobile: user.mobile });
  if (!job) return errorResponse(c, "Job not found.", 404);
  return successResponse(c, job);
});

// POST /api/home-services/jobs
homeServicesRoutes.post("/home-services/jobs", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const id = `job-${Date.now()}`;

    const created = await JobRecordModel.create({
      id,
      mobile: user.mobile,
      clientName: user.name,
      serviceId: body.serviceId,
      serviceName: body.serviceName || "Home Service Job",
      status: "requested",
      address: body.address || "",
      issueTypes: Array.isArray(body.issueTypes) ? body.issueTypes : [],
      amount: body.amount || 499,
      scheduledAt: body.date ? `${body.date} ${body.slot || ""}` : undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    return successResponse(c, created, undefined, 201);
  } catch (err) {
    console.error("[Create Job Error]", err);
    return errorResponse(c, "Failed to create home service job.", 500);
  }
});

// POST /api/jobs/:id/start-otp
homeServicesRoutes.post("/jobs/:id/start-otp", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const job = await JobRecordModel.findOne({ id });
  if (!job) return errorResponse(c, "Job not found.", 404);

  const startOtp = Math.floor(1000 + Math.random() * 9000).toString();
  job.startOtp = startOtp;
  await job.save();

  console.log(`[JOB] 🛠️ Start-Job OTP for Job ${id}: >>> ${startOtp} <<<`);

  return successResponse(c, { otp: startOtp, expiresInSeconds: 300 });
});

// POST /api/jobs/:id/rating
homeServicesRoutes.post("/jobs/:id/rating", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const stars = Number(body.stars) || 5;

  const job = await JobRecordModel.findOneAndUpdate(
    { id },
    { $set: { rating: stars, ratingComment: body.comment || "" } },
    { new: true }
  );

  if (!job) return errorResponse(c, "Job not found.", 404);
  return successResponse(c, job);
});

// Documents: GET & POST /api/documents
homeServicesRoutes.get("/documents", authMiddleware, async (c) => {
  const user = c.get("user");
  const docs = await DocumentRecordModel.find({ mobile: user.mobile }).sort({ createdAt: -1 });
  return successResponse(c, docs);
});

homeServicesRoutes.post("/documents", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const id = `doc-${Date.now()}`;

  const created = await DocumentRecordModel.create({
    id,
    mobile: user.mobile,
    docType: body.docType || "Aadhaar Card",
    fileName: body.fileName || "document.pdf",
    watermark: "For Kaundinya ID Update Only",
    createdAt: new Date().toISOString().slice(0, 10),
  });

  return successResponse(c, created, undefined, 201);
});

// Printouts: GET & POST /api/printouts
homeServicesRoutes.get("/printouts", authMiddleware, async (c) => {
  const user = c.get("user");
  const printouts = await PrintJobModel.find({ mobile: user.mobile }).sort({ createdAt: -1 });
  return successResponse(c, printouts);
});

homeServicesRoutes.post("/printouts", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const id = `print-${Date.now()}`;
  const copies = Number(body.copies) || 1;

  const created = await PrintJobModel.create({
    id,
    mobile: user.mobile,
    fileName: body.fileName || "printout.pdf",
    copies,
    price: copies * 5,
    status: "queued",
    createdAt: new Date().toISOString().slice(0, 10),
  });

  return successResponse(c, created, undefined, 201);
});

// Interiors: GET & POST /api/interiors/consultations
homeServicesRoutes.get("/interiors/consultations", authMiddleware, async (c) => {
  const user = c.get("user");
  const items = await InteriorConsultationModel.find({ mobile: user.mobile }).sort({
    createdAt: -1,
  });
  return successResponse(c, items);
});

homeServicesRoutes.post("/interiors/consultations", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const id = `int-${Date.now()}`;

  const created = await InteriorConsultationModel.create({
    id,
    name: body.name || user.name,
    mobile: user.mobile,
    style: body.style || "Modern Minimalist",
    budget: body.budget || "₹5L - ₹10L",
    notes: body.notes,
    status: "requested",
    createdAt: new Date().toISOString().slice(0, 10),
  });

  return successResponse(c, created, undefined, 201);
});

// Admin Jobs
export const adminHomeServicesRoutes = new Hono();
adminHomeServicesRoutes.use("*", adminAuthMiddleware);

adminHomeServicesRoutes.get("/jobs", async (c) => {
  const jobs = await JobRecordModel.find().sort({ createdAt: -1 });
  return successResponse(c, jobs);
});

adminHomeServicesRoutes.patch("/jobs/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const update: Record<string, unknown> = { ...body };

  // Keep the human-readable technician name in sync with the assigned staff id.
  if (typeof body.technicianId === "string") {
    const staff = body.technicianId
      ? await StaffModel.findOne({ id: body.technicianId })
      : null;
    update.technician = staff ? staff.name : null;
  }

  const updated = await JobRecordModel.findOneAndUpdate(
    { id },
    { $set: update },
    { new: true }
  );
  if (!updated) return errorResponse(c, "Job not found.", 404);
  return successResponse(c, updated);
});
