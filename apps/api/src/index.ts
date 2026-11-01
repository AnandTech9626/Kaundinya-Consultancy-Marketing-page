import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.js";
import { connectDB, isDbConnected } from "./db/connect.js";
import { adminGeneralRoutes } from "./routes/admin.js";
import { adminAuthRoutes } from "./routes/adminAuth.js";
import { authRoutes } from "./routes/auth.js";
import { adminEnquiryRoutes, enquiryRoutes } from "./routes/enquiries.js";
import {
  adminHomeServicesRoutes,
  homeServicesRoutes,
} from "./routes/modules/homeServices.js";
import {
  adminInsuranceRoutes,
  insuranceRoutes,
} from "./routes/modules/insurance.js";
import { adminPipelineRoutes, loansRoutes } from "./routes/modules/loans.js";
import {
  adminRealEstateRoutes,
  realEstateRoutes,
} from "./routes/modules/realEstate.js";
import {
  adminNotificationRoutes,
  notificationRoutes,
} from "./routes/notifications.js";
import { adminRequestRoutes, requestRoutes } from "./routes/requests.js";
import { errorResponse } from "./utils/response.js";

const app = new Hono().basePath("/api");

// Enable CORS for all frontends (Marketing, App, Admin, Localhost)
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  })
);

// DB auto-connect middleware for serverless / edge invocations
app.use("*", async (c, next) => {
  try {
    if (!isDbConnected() && config.mongoUri && !config.mongoUri.includes("<db_username>")) {
      await connectDB();
    }
  } catch (err) {
    console.warn("[MongoDB] Auto-connect warning (proceeding without DB lock):", err);
  }
  await next();
});

// Health & Status endpoint
app.get("/health", (c) => {
  return c.json({
    success: true,
    data: {
      status: "ok",
      service: "@kaundinya/api",
      dbConnected: isDbConnected(),
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

// Mount Routes
app.route("/", authRoutes);
app.route("/enquiries", enquiryRoutes);
app.route("/requests", requestRoutes);
app.route("/notifications", notificationRoutes);

// Module Routes
app.route("/", realEstateRoutes);
app.route("/", insuranceRoutes);
app.route("/", homeServicesRoutes);
app.route("/", loansRoutes);

// Admin Auth
app.route("/admin/auth", adminAuthRoutes);

// Admin Routes
app.route("/admin/enquiries", adminEnquiryRoutes);
app.route("/admin/requests", adminRequestRoutes);
app.route("/admin/notifications", adminNotificationRoutes);
app.route("/admin", adminGeneralRoutes);
app.route("/admin", adminRealEstateRoutes);
app.route("/admin", adminInsuranceRoutes);
app.route("/admin", adminHomeServicesRoutes);
app.route("/admin", adminPipelineRoutes);

// 404 Not Found Handler
app.notFound((c) => {
  return errorResponse(c, `Endpoint not found: ${c.req.method} ${c.req.path}`, 404);
});

// Global Error Handler
app.onError((err, c) => {
  console.error(`[API Uncaught Error] ${c.req.method} ${c.req.path}:`, err);
  return errorResponse(c, err.message || "Internal server error.", 500);
});

// Start local server if executed directly via Node / tsx
if (process.env.NODE_ENV !== "test") {
  const port = config.port;
  console.log(`\n🚀 Kaundinya API Server launching on http://localhost:${port}/api`);
  console.log(`📡 Health Check URL: http://localhost:${port}/api/health\n`);

  try {
    serve({
      fetch: app.fetch,
      port,
    });
  } catch (err) {
    console.error("Failed to start server listener:", err);
  }
}

export default app;
