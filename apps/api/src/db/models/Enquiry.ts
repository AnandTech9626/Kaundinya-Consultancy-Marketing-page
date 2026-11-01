import mongoose, { Document, Schema } from "mongoose";
import type { EnquiryStatus, Priority } from "@kaundinya/config";

export interface IEnquiryNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface IEnquiry extends Document {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  serviceCategory: string;
  specificService: string;
  pinCode: string;
  comments: string;
  consent: boolean;
  status: EnquiryStatus;
  priority: Priority;
  assignedTo: string | null;
  followUpAt: string | null;
  source: string;
  createdAt: string;
  notes: IEnquiryNote[];
}

const EnquiryNoteSchema = new Schema<IEnquiryNote>(
  {
    id: { type: String, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const EnquirySchema = new Schema<IEnquiry>(
  {
    id: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    mobile: { type: String, required: true, index: true, trim: true },
    serviceCategory: { type: String, required: true },
    specificService: { type: String, default: "" },
    pinCode: { type: String, default: "" },
    comments: { type: String, default: "" },
    consent: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "lost"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedTo: { type: String, default: null },
    followUpAt: { type: String, default: null },
    source: { type: String, default: "marketing" },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    notes: { type: [EnquiryNoteSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const EnquiryModel =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
