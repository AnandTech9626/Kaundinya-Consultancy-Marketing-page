import mongoose, { Document, Schema } from "mongoose";
import type { RequestStatus } from "@kaundinya/config";

export interface IServiceRequest extends Document {
  id: string;
  clientName: string;
  mobile: string;
  serviceCategory: string;
  specificService: string;
  status: RequestStatus;
  createdAt: string;
  comments: string;
  assignedTo: string | null;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    id: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    serviceCategory: { type: String, required: true },
    specificService: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "in_progress", "completed", "cancelled"],
      default: "new",
      index: true,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    comments: { type: String, default: "" },
    assignedTo: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const ServiceRequestModel =
  mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);
