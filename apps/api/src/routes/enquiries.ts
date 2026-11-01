import { Hono } from "hono";
import { z } from "zod";
import { EnquiryModel } from "../db/models/Enquiry.js";
import { UserModel } from "../db/models/User.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const enquiryRoutes = new Hono();

const enquiryPayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().or(z.literal("")).default(""),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Mobile must be 10 digits starting with 6-9"),
  serviceCategory: z.string().min(1),
  specificService: z.string().optional().default(""),
  pinCode: z.string().optional().default(""),
  comments: z.string().max(2000).optional().default(""),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Consent must be true" }),
  }),
});

// POST /api/enquiries (Public Marketing Submission)
enquiryRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = enquiryPayloadSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      return errorResponse(c, "Validation failed.", 422, errors);
    }

    const data = parsed.data;
    const enquiryId = `enq-${Date.now()}`;

    // Create enquiry lead
    const createdEnquiry = await EnquiryModel.create({
      id: enquiryId,
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      serviceCategory: data.serviceCategory,
      specificService: data.specificService,
      pinCode: data.pinCode,
      comments: data.comments,
      consent: data.consent,
      status: "new",
      priority: "medium",
      assignedTo: null,
      followUpAt: null,
      source: "marketing",
      createdAt: new Date().toISOString().slice(0, 10),
      notes: [],
    });

    // Also update or pre-populate User profile with this name and email
    await UserModel.findOneAndUpdate(
      { mobile: data.mobile },
      {
        $setOnInsert: { mobile: data.mobile, joinedAt: new Date().toISOString().slice(0, 10) },
        $set: {
          name: data.fullName,
          ...(data.email ? { email: data.email } : {}),
          ...(data.pinCode ? { pinCode: data.pinCode } : {}),
        },
      },
      { upsert: true, new: true }
    );

    return successResponse(c, { id: createdEnquiry.id }, "Enquiry received", 201);
  } catch (err) {
    console.error("[Create Enquiry Error]", err);
    return errorResponse(c, "Failed to submit enquiry.", 500);
  }
});

// Admin routes for Enquiries
export const adminEnquiryRoutes = new Hono();
adminEnquiryRoutes.use("*", adminAuthMiddleware);

// GET /api/admin/enquiries
adminEnquiryRoutes.get("/", async (c) => {
  try {
    const status = c.req.query("status");
    const q = c.req.query("q")?.toLowerCase();

    const query: Record<string, unknown> = {};
    if (status) {
      query.status = status;
    }

    let enquiries = await EnquiryModel.find(query).sort({ createdAt: -1, _id: -1 });

    if (q) {
      enquiries = enquiries.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.mobile.includes(q) ||
          e.serviceCategory.toLowerCase().includes(q)
      );
    }

    return successResponse(c, enquiries);
  } catch (err) {
    console.error("[Admin Fetch Enquiries Error]", err);
    return errorResponse(c, "Failed to fetch enquiries.", 500);
  }
});

// GET /api/admin/enquiries/:id
adminEnquiryRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const enquiry = await EnquiryModel.findOne({ id });

  if (!enquiry) {
    return errorResponse(c, "Enquiry not found.", 404);
  }

  return successResponse(c, enquiry);
});

// PATCH /api/admin/enquiries/:id
adminEnquiryRoutes.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const updateFields: Record<string, unknown> = {};
    if (body.status) updateFields.status = body.status;
    if (body.priority) updateFields.priority = body.priority;
    if (body.assignedTo !== undefined) updateFields.assignedTo = body.assignedTo;
    if (body.followUpAt !== undefined) updateFields.followUpAt = body.followUpAt;

    const updated = await EnquiryModel.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return errorResponse(c, "Enquiry not found.", 404);
    }

    return successResponse(c, updated);
  } catch (err) {
    console.error("[Admin Update Enquiry Error]", err);
    return errorResponse(c, "Failed to update enquiry.", 500);
  }
});

// POST /api/admin/enquiries/:id/notes
adminEnquiryRoutes.post("/:id/notes", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const text = String(body.text || "").trim();

    if (!text || text.length > 2000) {
      return errorResponse(c, "Note text is required (max 2000 characters).", 422);
    }

    const tokenUser = c.get("user");
    const newNote = {
      id: `note-${Date.now()}`,
      author: tokenUser.name || "Staff Member",
      text,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = await EnquiryModel.findOneAndUpdate(
      { id },
      { $push: { notes: newNote } },
      { new: true }
    );

    if (!updated) {
      return errorResponse(c, "Enquiry not found.", 404);
    }

    return successResponse(c, updated);
  } catch (err) {
    console.error("[Admin Add Note Error]", err);
    return errorResponse(c, "Failed to add note.", 500);
  }
});
