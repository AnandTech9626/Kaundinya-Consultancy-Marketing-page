import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  pinCode?: string;
  role: "client" | "admin" | "agent";
  joinedAt: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, trim: true, lowercase: true, default: "" },
    mobile: { type: String, required: true, unique: true, index: true, trim: true },
    pinCode: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["client", "admin", "agent"], default: "client" },
    joinedAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    verified: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
