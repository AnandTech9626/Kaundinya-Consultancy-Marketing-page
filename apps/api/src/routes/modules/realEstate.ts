import { Hono } from "hono";
import {
  PropertyModel,
  SiteVisitModel,
  ValuationModel,
} from "../../db/models/RealEstate.js";
import { adminAuthMiddleware, authMiddleware } from "../../middleware/auth.js";
import { errorResponse, successResponse } from "../../utils/response.js";

export const realEstateRoutes = new Hono();

// GET /api/properties (Public)
realEstateRoutes.get("/properties", async (c) => {
  try {
    const listingType = c.req.query("listingType");
    const location = c.req.query("location")?.toLowerCase();
    const bhk = c.req.query("bhk");
    const budgetMax = c.req.query("budgetMax");

    const query: Record<string, unknown> = {
      status: "active",
    };

    if (listingType) query.listingType = listingType;
    if (bhk) query.bhk = bhk;
    if (budgetMax) query.price = { $lte: Number(budgetMax) };

    let properties = await PropertyModel.find(query).sort({ createdAt: -1 });

    if (location) {
      properties = properties.filter((p) => p.location.toLowerCase().includes(location));
    }

    return successResponse(c, properties);
  } catch (err) {
    console.error("[Get Properties Error]", err);
    return errorResponse(c, "Failed to fetch properties.", 500);
  }
});

// GET /api/properties/:id
realEstateRoutes.get("/properties/:id", async (c) => {
  const id = c.req.param("id");
  const prop = await PropertyModel.findOne({ id });
  if (!prop) {
    return errorResponse(c, "Property not found.", 404);
  }
  return successResponse(c, prop);
});

// POST /api/properties (Submit listing)
realEstateRoutes.post("/properties", authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const id = `prop-${Date.now()}`;

    const created = await PropertyModel.create({
      id,
      title: body.title || "Untitled Property",
      description: body.description || "",
      listingType: body.listingType || "rent",
      propertyType: body.propertyType || "Apartment",
      bhk: body.bhk,
      location: body.location || "Hyderabad",
      city: body.city || "Hyderabad",
      pincode: body.pincode || "500001",
      price: Number(body.price) || 0,
      priceUnit: body.priceUnit || "month",
      areaSqft: Number(body.areaSqft) || 1000,
      furnishing: body.furnishing,
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      images: Array.isArray(body.images) ? body.images : [],
      status: "draft",
      featured: false,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    return successResponse(c, created, undefined, 201);
  } catch (err) {
    console.error("[Create Property Error]", err);
    return errorResponse(c, "Failed to submit property listing.", 500);
  }
});

// POST /api/site-visits
realEstateRoutes.post("/site-visits", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const id = `sv-${Date.now()}`;

    const created = await SiteVisitModel.create({
      id,
      propertyId: body.propertyId || "prop-general",
      propertyTitle: body.propertyTitle || "Site Visit",
      clientName: body.clientName || user.name,
      mobile: user.mobile,
      date: body.date || new Date().toISOString().slice(0, 10),
      slot: body.slot || "10:00 AM - 12:00 PM",
      status: "requested",
      notes: body.notes || "",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    return successResponse(c, created, undefined, 201);
  } catch (err) {
    console.error("[Book Site Visit Error]", err);
    return errorResponse(c, "Failed to book site visit.", 500);
  }
});

// GET /api/site-visits
realEstateRoutes.get("/site-visits", authMiddleware, async (c) => {
  const user = c.get("user");
  const visits = await SiteVisitModel.find({ mobile: user.mobile }).sort({ createdAt: -1 });
  return successResponse(c, visits);
});

// POST /api/valuations
realEstateRoutes.post("/valuations", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const id = `val-${Date.now()}`;

    const created = await ValuationModel.create({
      id,
      ownerName: body.ownerName || user.name,
      mobile: user.mobile,
      propertyType: body.propertyType || "Apartment",
      location: body.location || "Hyderabad",
      pincode: body.pincode || "500001",
      expectedPrice: body.expectedPrice ? Number(body.expectedPrice) : undefined,
      notes: body.notes,
      status: "requested",
      createdAt: new Date().toISOString().slice(0, 10),
    });

    return successResponse(c, created, undefined, 201);
  } catch (err) {
    console.error("[Book Valuation Error]", err);
    return errorResponse(c, "Failed to request valuation.", 500);
  }
});

// GET /api/valuations
realEstateRoutes.get("/valuations", authMiddleware, async (c) => {
  const user = c.get("user");
  const valuations = await ValuationModel.find({ mobile: user.mobile }).sort({ createdAt: -1 });
  return successResponse(c, valuations);
});

// Admin endpoints for Real Estate
export const adminRealEstateRoutes = new Hono();
adminRealEstateRoutes.use("*", adminAuthMiddleware);

adminRealEstateRoutes.get("/properties", async (c) => {
  const props = await PropertyModel.find().sort({ createdAt: -1 });
  return successResponse(c, props);
});

adminRealEstateRoutes.patch("/properties/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updated = await PropertyModel.findOneAndUpdate({ id }, { $set: body }, { new: true });
  if (!updated) return errorResponse(c, "Property not found.", 404);
  return successResponse(c, updated);
});

adminRealEstateRoutes.get("/site-visits", async (c) => {
  const visits = await SiteVisitModel.find().sort({ createdAt: -1 });
  return successResponse(c, visits);
});

adminRealEstateRoutes.patch("/site-visits/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updated = await SiteVisitModel.findOneAndUpdate({ id }, { $set: body }, { new: true });
  if (!updated) return errorResponse(c, "Site visit not found.", 404);
  return successResponse(c, updated);
});

adminRealEstateRoutes.get("/valuations", async (c) => {
  const valuations = await ValuationModel.find().sort({ createdAt: -1 });
  return successResponse(c, valuations);
});

adminRealEstateRoutes.patch("/valuations/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const updated = await ValuationModel.findOneAndUpdate({ id }, { $set: body }, { new: true });
  if (!updated) return errorResponse(c, "Valuation not found.", 404);
  return successResponse(c, updated);
});
