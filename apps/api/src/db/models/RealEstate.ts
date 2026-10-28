import mongoose, { Document, Schema } from "mongoose";

export interface IPropertyListing extends Document {
  id: string;
  title: string;
  description: string;
  listingType: "rent" | "sale";
  propertyType: string;
  bhk?: string;
  location: string;
  city: string;
  pincode: string;
  price: number;
  priceUnit: "month" | "total";
  areaSqft: number;
  furnishing?: string;
  amenities: string[];
  images: string[];
  status: "draft" | "active" | "sold" | "rented";
  featured: boolean;
  createdAt: string;
}

const PropertyListingSchema = new Schema<IPropertyListing>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    listingType: { type: String, enum: ["rent", "sale"], required: true, index: true },
    propertyType: { type: String, required: true },
    bhk: { type: String },
    location: { type: String, required: true },
    city: { type: String, default: "Hyderabad" },
    pincode: { type: String, required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ["month", "total"], default: "total" },
    areaSqft: { type: Number, required: true },
    furnishing: { type: String },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "active", "sold", "rented"],
      default: "draft",
      index: true,
    },
    featured: { type: Boolean, default: false },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const PropertyModel =
  mongoose.models.Property || mongoose.model<IPropertyListing>("Property", PropertyListingSchema);

export interface ISiteVisit extends Document {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  mobile: string;
  date: string;
  slot: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  adviserId?: string;
  notes?: string;
  createdAt: string;
}

const SiteVisitSchema = new Schema<ISiteVisit>(
  {
    id: { type: String, required: true, unique: true, index: true },
    propertyId: { type: String, required: true },
    propertyTitle: { type: String, required: true },
    clientName: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "confirmed", "completed", "cancelled"],
      default: "requested",
    },
    adviserId: { type: String },
    notes: { type: String },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const SiteVisitModel =
  mongoose.models.SiteVisit || mongoose.model<ISiteVisit>("SiteVisit", SiteVisitSchema);

export interface IValuation extends Document {
  id: string;
  ownerName: string;
  mobile: string;
  propertyType: string;
  location: string;
  pincode: string;
  expectedPrice?: number;
  status: "requested" | "scheduled" | "completed";
  notes?: string;
  createdAt: string;
}

const ValuationSchema = new Schema<IValuation>(
  {
    id: { type: String, required: true, unique: true, index: true },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    propertyType: { type: String, required: true },
    location: { type: String, required: true },
    pincode: { type: String, required: true },
    expectedPrice: { type: Number },
    status: {
      type: String,
      enum: ["requested", "scheduled", "completed"],
      default: "requested",
    },
    notes: { type: String },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export const ValuationModel =
  mongoose.models.Valuation || mongoose.model<IValuation>("Valuation", ValuationSchema);
