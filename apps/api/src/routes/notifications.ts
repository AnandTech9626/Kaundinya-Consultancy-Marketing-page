import { Hono } from "hono";
import { NotificationModel } from "../db/models/Notification.js";
import { UserModel } from "../db/models/User.js";
import { adminAuthMiddleware, authMiddleware } from "../middleware/auth.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const notificationRoutes = new Hono();

// GET /api/notifications
notificationRoutes.get("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const notifications = await NotificationModel.find({ mobile: user.mobile }).sort({
      createdAt: -1,
      _id: -1,
    });

    return successResponse(c, notifications);
  } catch (err) {
    console.error("[Get Notifications Error]", err);
    return errorResponse(c, "Failed to fetch notifications.", 500);
  }
});

// PATCH /api/notifications/:id/read
notificationRoutes.patch("/:id/read", authMiddleware, async (c) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");

    const notification = await NotificationModel.findOneAndUpdate(
      { id, mobile: user.mobile },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return errorResponse(c, "Notification not found.", 404);
    }

    return successResponse(c, notification);
  } catch (err) {
    console.error("[Mark Notification Read Error]", err);
    return errorResponse(c, "Failed to update notification.", 500);
  }
});

// POST /api/notifications/read-all
notificationRoutes.post("/read-all", authMiddleware, async (c) => {
  try {
    const user = c.get("user");

    await NotificationModel.updateMany({ mobile: user.mobile }, { $set: { read: true } });

    const allNotifications = await NotificationModel.find({ mobile: user.mobile }).sort({
      createdAt: -1,
      _id: -1,
    });

    return successResponse(c, allNotifications);
  } catch (err) {
    console.error("[Mark All Read Error]", err);
    return errorResponse(c, "Failed to mark all as read.", 500);
  }
});

// Admin Broadcast Route
export const adminNotificationRoutes = new Hono();
adminNotificationRoutes.use("*", adminAuthMiddleware);

adminNotificationRoutes.post("/broadcast", async (c) => {
  try {
    const body = await c.req.json();
    const title = String(body.title || "").trim();
    const message = String(body.message || "").trim();
    const audience = body.audience === "verified" ? "verified" : "all";

    if (!title || !message) {
      return errorResponse(c, "Title and message are required.", 422);
    }

    const query: Record<string, unknown> = {};
    if (audience === "verified") {
      query.verified = true;
    }

    const users = await UserModel.find(query);
    const today = new Date().toISOString().slice(0, 10);

    const notificationsToInsert = users.map((u) => ({
      id: `ntf-broadcast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mobile: u.mobile,
      title,
      message,
      createdAt: today,
      read: false,
    }));

    if (notificationsToInsert.length > 0) {
      await NotificationModel.insertMany(notificationsToInsert);
    }

    return successResponse(c, {
      id: `ntf-broadcast-${Date.now()}`,
      recipients: notificationsToInsert.length,
    });
  } catch (err) {
    console.error("[Broadcast Notification Error]", err);
    return errorResponse(c, "Failed to broadcast notification.", 500);
  }
});
