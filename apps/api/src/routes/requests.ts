import { Hono } from "hono";
import { z } from "zod";
import { NotificationModel } from "../db/models/Notification.js";
import { ServiceRequestModel } from "../db/models/ServiceRequest.js";
import { adminAuthMiddleware, authMiddleware } from "../middleware/auth.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const requestRoutes = new Hono();

const createRequestSchema = z.object({
  serviceCategory: z.string().min(1, "Service category is required"),
  specificService: z.string().min(1, "Specific service is required"),
  comments: z.string().max(2000).optional().default(""),
});

// GET /api/requests (Client Requests - Scoped to User)
requestRoutes.get("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const requests = await ServiceRequestModel.find({ mobile: user.mobile }).sort({
      createdAt: -1,
      _id: -1,
    });

    return successResponse(c, requests);
  } catch (err) {
    console.error("[Get Requests Error]", err);
    return errorResponse(c, "Failed to fetch requests.", 500);
  }
});

// GET /api/requests/:id
requestRoutes.get("/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");

    const reqRecord = await ServiceRequestModel.findOne({ id, mobile: user.mobile });

    if (!reqRecord) {
      return errorResponse(c, "Request not found.", 404);
    }

    return successResponse(c, reqRecord);
  } catch (err) {
    console.error("[Get Request Detail Error]", err);
    return errorResponse(c, "Failed to fetch request.", 500);
  }
});

// POST /api/requests (Submit new service request)
requestRoutes.post("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const parsed = createRequestSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(c, "Validation failed.", 422, {
        serviceCategory: parsed.error.issues[0]?.message || "Invalid input",
      });
    }

    const { serviceCategory, specificService, comments } = parsed.data;
    const reqId = `req-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);

    const created = await ServiceRequestModel.create({
      id: reqId,
      clientName: user.name || "Kaundinya Client",
      mobile: user.mobile,
      serviceCategory,
      specificService,
      status: "new",
      createdAt: today,
      comments: comments.trim(),
      assignedTo: null,
    });

    // Side effect: Automatically trigger a notification for the user
    await NotificationModel.create({
      id: `ntf-${Date.now()}`,
      mobile: user.mobile,
      title: "Request received",
      message: `Your request for ${specificService} has been received and is being processed.`,
      createdAt: today,
      read: false,
    });

    return successResponse(c, created, undefined, 201);
  } catch (err) {
    console.error("[Create Request Error]", err);
    return errorResponse(c, "Failed to create request.", 500);
  }
});

// PATCH /api/requests/:id (Admin status transition)
requestRoutes.patch("/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const status = body.status;

    const validStatuses = ["new", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return errorResponse(c, "Invalid status transition.", 409);
    }

    const existing = await ServiceRequestModel.findOne({ id });
    if (!existing) {
      return errorResponse(c, "Request not found.", 404);
    }

    // Check invalid state transitions (cannot move completed/cancelled)
    if (existing.status === "completed" && status !== "completed") {
      return errorResponse(c, "Cannot move a completed request.", 409);
    }

    existing.status = status;
    if (body.assignedTo !== undefined) {
      existing.assignedTo = body.assignedTo;
    }
    await existing.save();

    return successResponse(c, existing);
  } catch (err) {
    console.error("[Update Request Status Error]", err);
    return errorResponse(c, "Failed to update request.", 500);
  }
});

// GET /api/admin/requests (Admin view of all requests)
export const adminRequestRoutes = new Hono();
adminRequestRoutes.use("*", adminAuthMiddleware);

adminRequestRoutes.get("/", async (c) => {
  try {
    const status = c.req.query("status");
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const requests = await ServiceRequestModel.find(query).sort({ createdAt: -1, _id: -1 });

    return successResponse(c, requests);
  } catch (err) {
    console.error("[Admin Get Requests Error]", err);
    return errorResponse(c, "Failed to fetch admin requests.", 500);
  }
});
