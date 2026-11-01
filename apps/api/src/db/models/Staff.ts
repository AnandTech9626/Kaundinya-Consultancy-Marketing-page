import mongoose, { Document, Schema } from "mongoose";
import type { StaffRole } from "@kaundinya/config";

export interface IStaff extends Document {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  passwordHash?: string;
}

const StaffSchema = new Schema<IStaff>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "agent"], default: "agent" },
    active: { type: Boolean, default: true },
    passwordHash: { type: String, default: "", select: false },
  },
  {
    timestamps: true,
  }
);

export const StaffModel = mongoose.models.Staff || mongoose.model<IStaff>("Staff", StaffSchema);
