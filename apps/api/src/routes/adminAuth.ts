import { Hono } from "hono";
import { z } from "zod";
import { config } from "../config.js";
import { StaffModel } from "../db/models/Staff.js";
import { hashPassword, verifyPassword } from "../services/password.js";
import { signToken } from "../services/jwt.js";
import { ensureStaffSeeded } from "../services/staff.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const adminAuthRoutes = new Hono();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(4),
});

// POST /api/admin/auth/login
adminAuthRoutes.post("/login", async (c) => {
  try {
    await ensureStaffSeeded();

    const body = await c.req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(c, "Enter a valid email and password.", 422, {
        email: "Enter a valid email address.",
        password: "Password must be at least 4 characters.",
      });
    }

    const staff = await StaffModel.findOne({ email: parsed.data.email }).select(
      "+passwordHash"
    );

    if (!staff || !staff.active) {
      return errorResponse(c, "Invalid email or password.", 401);
    }

    let storedHash = staff.passwordHash || "";

    // Backfill staff created before password support was added.
    if (!storedHash) {
      if (parsed.data.password !== config.staffDefaultPassword) {
        return errorResponse(c, "Invalid email or password.", 401);
      }
      storedHash = hashPassword(config.staffDefaultPassword);
      staff.passwordHash = storedHash;
      await staff.save();
    }

    if (!verifyPassword(parsed.data.password, storedHash)) {
      return errorResponse(c, "Invalid email or password.", 401);
    }

    const token = await signToken({
      mobile: "",
      name: staff.name,
      role: staff.role,
      email: staff.email,
    });

    return successResponse(
      c,
      {
        token,
        staff: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          active: staff.active,
        },
      },
      "Signed in"
    );
  } catch (err) {
    console.error("[Admin Login Error]", err);
    return errorResponse(c, "Sign in failed. Please try again.", 500);
  }
});
