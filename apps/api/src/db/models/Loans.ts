import mongoose, { Document, Schema } from "mongoose";

export interface ILoanApplication extends Document {
  id: string;
  mobile: string;
  clientName?: string;
  loanType: "Home" | "Personal" | "Business" | "Mortgage";
  amount: number;
  status: "application" | "verified" | "submitted" | "approved" | "disbursed";
  bank: string;
  monthlyIncome?: number;
  tenureMonths?: number;
  employmentType?: "salaried" | "self-employed";
  purpose?: string;
  documents?: string[];
  advisor?: string;
  propertyId?: string;
  createdAt: string;
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    id: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    clientName: { type: String },
    loanType: {
      type: String,
      enum: ["Home", "Personal", "Business", "Mortgage"],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["application", "verified", "submitted", "approved", "disbursed"],
      default: "application",
      index: true,
    },
    bank: { type: String, default: "HDFC Bank" },
    monthlyIncome: { type: Number },
    tenureMonths: { type: Number },
    employmentType: { type: String, enum: ["salaried", "self-employed"] },
    purpose: { type: String },
    documents: { type: [String], default: [] },
    advisor: { type: String },
    propertyId: { type: String },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const LoanApplicationModel =
  mongoose.models.LoanApplication ||
  mongoose.model<ILoanApplication>("LoanApplication", LoanApplicationSchema);
