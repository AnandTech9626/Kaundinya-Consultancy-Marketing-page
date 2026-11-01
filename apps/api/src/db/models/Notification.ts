import mongoose, { Document, Schema } from "mongoose";

export interface IAppNotification extends Document {
  id: string;
  mobile: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const NotificationSchema = new Schema<IAppNotification>(
  {
    id: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel =
  mongoose.models.AppNotification ||
  mongoose.model<IAppNotification>("AppNotification", NotificationSchema);
