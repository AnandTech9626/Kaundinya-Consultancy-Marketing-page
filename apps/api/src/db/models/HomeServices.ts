import mongoose, { Document, Schema } from "mongoose";

export interface IMeasurementBooking extends Document {
  id: string;
  mobile: string;
  serviceId: string;
  serviceName: string;
  address: string;
  pincode: string;
  date: string;
  slot: string;
  status: "requested" | "scheduled" | "completed";
  createdAt: string;
}

const MeasurementBookingSchema = new Schema<IMeasurementBooking>(
  {
    id: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "scheduled", "completed"],
      default: "requested",
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const MeasurementBookingModel =
  mongoose.models.MeasurementBooking ||
  mongoose.model<IMeasurementBooking>("MeasurementBooking", MeasurementBookingSchema);

export interface IJobRecord extends Document {
  id: string;
  mobile: string;
  clientName?: string;
  serviceId?: string;
  serviceName: string;
  status: "requested" | "assigned" | "en_route" | "in_progress" | "completed";
  technician?: string;
  technicianId?: string;
  technicianPhone?: string;
  scheduledAt?: string;
  startOtp?: string;
  rating?: number;
  ratingComment?: string;
  address?: string;
  issueTypes?: string[];
  amount?: number;
  createdAt: string;
}

const JobRecordSchema = new Schema<IJobRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    clientName: { type: String },
    serviceId: { type: String },
    serviceName: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "assigned", "en_route", "in_progress", "completed"],
      default: "requested",
      index: true,
    },
    technician: { type: String },
    technicianId: { type: String },
    technicianPhone: { type: String },
    scheduledAt: { type: String },
    startOtp: { type: String },
    rating: { type: Number },
    ratingComment: { type: String },
    address: { type: String },
    issueTypes: { type: [String], default: [] },
    amount: { type: Number },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const JobRecordModel =
  mongoose.models.JobRecord || mongoose.model<IJobRecord>("JobRecord", JobRecordSchema);

export interface IDocumentRecord extends Document {
  id: string;
  mobile: string;
  docType: string;
  fileName: string;
  fileUrl?: string;
  watermark: string;
  createdAt: string;
}

const DocumentRecordSchema = new Schema<IDocumentRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    docType: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String },
    watermark: { type: String, default: "For Kaundinya ID Update Only" },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const DocumentRecordModel =
  mongoose.models.DocumentRecord ||
  mongoose.model<IDocumentRecord>("DocumentRecord", DocumentRecordSchema);

export interface IPrintJob extends Document {
  id: string;
  mobile: string;
  fileName: string;
  copies: number;
  price: number;
  status: "queued" | "printing" | "completed";
  autoDeletedAt?: string;
  createdAt: string;
}

const PrintJobSchema = new Schema<IPrintJob>(
  {
    id: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    copies: { type: Number, default: 1 },
    price: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ["queued", "printing", "completed"],
      default: "queued",
    },
    autoDeletedAt: { type: String },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const PrintJobModel =
  mongoose.models.PrintJob || mongoose.model<IPrintJob>("PrintJob", PrintJobSchema);

export interface IInteriorConsultation extends Document {
  id: string;
  name: string;
  mobile: string;
  style: string;
  budget: string;
  notes?: string;
  status: "requested" | "contacted";
  createdAt: string;
}

const InteriorConsultationSchema = new Schema<IInteriorConsultation>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    style: { type: String, required: true },
    budget: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ["requested", "contacted"], default: "requested" },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const InteriorConsultationModel =
  mongoose.models.InteriorConsultation ||
  mongoose.model<IInteriorConsultation>("InteriorConsultation", InteriorConsultationSchema);
