import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  mobile: string;
  otp: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    mobile: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
  }
);

export const OtpModel = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
