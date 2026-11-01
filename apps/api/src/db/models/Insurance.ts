import mongoose, { Document, Schema } from "mongoose";

export interface IInsurancePlan extends Document {
  id: string;
  type: "life" | "health" | "motor" | "property";
  insurer: string;
  name: string;
  sumInsured: number;
  premium: number;
  tenureYears: number;
  features: string[];
  cashlessNetwork?: boolean;
  pospLicense?: string;
  familyOption?: "self" | "couple" | "parents" | "family";
}

const InsurancePlanSchema = new Schema<IInsurancePlan>(
  {
    id: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["life", "health", "motor", "property"],
      required: true,
      index: true,
    },
    insurer: { type: String, required: true },
    name: { type: String, required: true },
    sumInsured: { type: Number, required: true },
    premium: { type: Number, required: true },
    tenureYears: { type: Number, default: 1 },
    features: { type: [String], default: [] },
    cashlessNetwork: { type: Boolean, default: false },
    pospLicense: { type: String },
    familyOption: {
      type: String,
      enum: ["self", "couple", "parents", "family"],
    },
  },
  { timestamps: true }
);

export const InsurancePlanModel =
  mongoose.models.InsurancePlan ||
  mongoose.model<IInsurancePlan>("InsurancePlan", InsurancePlanSchema);

export interface IPolicyRecord extends Document {
  id: string;
  mobile: string;
  type: string;
  provider: string;
  policyNumber: string;
  coverAmount: number;
  premium: number;
  renewalDate: string;
  status: "active" | "expiring" | "lapsed";
  holder?: string;
  validFrom?: string;
  pdfUrl?: string;
}

const PolicyRecordSchema = new Schema<IPolicyRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    type: { type: String, required: true },
    provider: { type: String, required: true },
    policyNumber: { type: String, required: true, unique: true },
    coverAmount: { type: Number, required: true },
    premium: { type: Number, required: true },
    renewalDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "expiring", "lapsed"],
      default: "active",
      index: true,
    },
    holder: { type: String },
    validFrom: { type: String },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

export const PolicyRecordModel =
  mongoose.models.PolicyRecord ||
  mongoose.model<IPolicyRecord>("PolicyRecord", PolicyRecordSchema);

export interface IHospital extends Document {
  id: string;
  name: string;
  address: string;
  pincode: string;
  cashless: boolean;
  distanceKm?: number;
}

const HospitalSchema = new Schema<IHospital>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true, index: true },
    cashless: { type: Boolean, default: true },
    distanceKm: { type: Number },
  },
  { timestamps: true }
);

export const HospitalModel =
  mongoose.models.Hospital || mongoose.model<IHospital>("Hospital", HospitalSchema);
