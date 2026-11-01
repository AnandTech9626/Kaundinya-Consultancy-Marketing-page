import { Hono } from "hono";
import { z } from "zod";
import { OtpModel } from "../db/models/Otp.js";
import { UserModel } from "../db/models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { signToken } from "../services/jwt.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { config } from "../config.js";

export const authRoutes = new Hono();

// Mobile validation rule: exactly 10 digits, starts 6-9
const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Invalid mobile number. Must be exactly 10 digits starting with 6-9.");

// Send OTP
authRoutes.post("/otp/send", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = mobileSchema.safeParse(body.mobile);

    if (!parsed.success) {
      return errorResponse(c, "Invalid mobile number.", 422, {
        mobile: parsed.error.issues[0].message,
      });
    }

    const mobile = parsed.data;

    // Rate limit check: count OTP requests in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentOtps = await OtpModel.countDocuments({
      mobile,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (recentOtps >= 5) {
      return errorResponse(c, "Too many requests. Try again in 60s.", 429);
    }

    // Generate 6-digit OTP
    const generatedOtp = config.isDev
      ? config.devOtp
      : Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB with 5 minutes expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OtpModel.create({
      mobile,
      otp: generatedOtp,
      expiresAt,
    });

    // In dev mode, log to console for instant developer feedback
    console.log(`\n========================================`);
    console.log(`[AUTH] 📱 OTP for ${mobile}: >>> ${generatedOtp} <<<`);
    console.log(`========================================\n`);

    return successResponse(c, { expiresInSeconds: 60 }, "OTP sent");
  } catch (err) {
    console.error("[OTP Send Error]", err);
    return errorResponse(c, "Failed to send OTP.", 500);
  }
});

// Verify OTP
authRoutes.post("/otp/verify", async (c) => {
  try {
    const body = await c.req.json();
    const mobileParse = mobileSchema.safeParse(body.mobile);
    const otp = String(body.otp || "").trim();

    if (!mobileParse.success) {
      return errorResponse(c, "Invalid mobile number.", 422);
    }

    if (!/^\d{6}$/.test(otp)) {
      return errorResponse(c, "Invalid OTP format. Must be 6 digits.", 400);
    }

    const mobile = mobileParse.data;

    // In dev mode, allow config.devOtp as a master bypass
    const isDevMatch = config.isDev && otp === config.devOtp;

    if (!isDevMatch) {
      // Find latest pending OTP
      const pendingOtp = await OtpModel.findOne({
        mobile,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!pendingOtp) {
        return errorResponse(c, "Invalid or expired OTP.", 400);
      }

      if (pendingOtp.attempts >= 5) {
        return errorResponse(c, "Too many attempts. Please request a new OTP.", 429);
      }

      if (pendingOtp.otp !== otp) {
        pendingOtp.attempts += 1;
        await pendingOtp.save();
        return errorResponse(c, "Invalid or expired OTP.", 400);
      }

      // Valid OTP: delete it so it can't be reused
      await OtpModel.deleteOne({ _id: pendingOtp._id });
    }

    // Find or create User
    let user = await UserModel.findOne({ mobile });

    if (!user) {
      user = await UserModel.create({
        name: "Kaundinya Client",
        mobile,
        email: "",
        role: "client",
        verified: true,
      });
    }

    // Generate JWT token
    const token = await signToken({
      mobile: user.mobile,
      name: user.name,
      role: user.role,
      email: user.email,
    });

    return successResponse(c, {
      token,
      user: {
        name: user.name,
        email: user.email || "",
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("[OTP Verify Error]", err);
    return errorResponse(c, "Failed to verify OTP.", 500);
  }
});

// GET /api/me
authRoutes.get("/me", authMiddleware, async (c) => {
  const tokenUser = c.get("user");
  const user = await UserModel.findOne({ mobile: tokenUser.mobile });

  if (!user) {
    return errorResponse(c, "User not found.", 404);
  }

  return successResponse(c, {
    name: user.name,
    email: user.email || "",
    mobile: user.mobile,
  });
});

// PATCH /api/me
authRoutes.patch("/me", authMiddleware, async (c) => {
  try {
    const tokenUser = c.get("user");
    const body = await c.req.json();

    const updateData: { name?: string; email?: string; pinCode?: string } = {};

    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      updateData.name = body.name.trim().slice(0, 80);
    }

    if (typeof body.email === "string") {
      updateData.email = body.email.trim().toLowerCase();
    }

    if (typeof body.pinCode === "string" && /^\d{6}$/.test(body.pinCode.trim())) {
      updateData.pinCode = body.pinCode.trim();
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { mobile: tokenUser.mobile },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return errorResponse(c, "User not found.", 404);
    }

    return successResponse(c, {
      name: updatedUser.name,
      email: updatedUser.email || "",
      mobile: updatedUser.mobile,
    });
  } catch (err) {
    console.error("[Update Me Error]", err);
    return errorResponse(c, "Failed to update profile.", 500);
  }
});

// POST /api/auth/logout
authRoutes.post("/auth/logout", authMiddleware, async (c) => {
  return c.body(null, 204);
});
