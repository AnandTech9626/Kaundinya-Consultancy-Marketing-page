import { config } from "../config.js";
import { StaffModel } from "../db/models/Staff.js";
import { hashPassword } from "./password.js";

const DEFAULT_STAFF = [
  {
    id: "st-1",
    name: "Kaundinya Admin",
    email: "admin@kaundinya.com",
    role: "admin" as const,
    active: true,
  },
  {
    id: "st-2",
    name: "Harika Garre",
    email: "harika@kaundinya.com",
    role: "agent" as const,
    active: true,
  },
  {
    id: "st-3",
    name: "Suresh Varma",
    email: "suresh@kaundinya.com",
    role: "agent" as const,
    active: true,
  },
];

/**
 * Seeds the default staff roster on first use so the admin panel always has
 * a working sign-in. Safe to call on every request: it no-ops when staff exist.
 */
export async function ensureStaffSeeded(): Promise<void> {
  const count = await StaffModel.countDocuments();
  if (count > 0) return;

  const passwordHash = hashPassword(config.staffDefaultPassword);
  try {
    await StaffModel.insertMany(
      DEFAULT_STAFF.map((member) => ({ ...member, passwordHash }))
    );
  } catch (err) {
    // Ignore duplicate-key races (another request seeded first).
    if ((err as { code?: number }).code !== 11000) throw err;
  }
}
