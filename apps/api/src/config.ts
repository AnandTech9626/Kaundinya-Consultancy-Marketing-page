import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kaundinya",
  jwtSecret: process.env.JWT_SECRET || "kaundinya_jwt_super_secret_production_key_2026",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  devOtp: process.env.DEV_OTP || "123456",
  staffDefaultPassword: process.env.STAFF_DEFAULT_PASSWORD || "kaundinya123",
  isDev: (process.env.NODE_ENV || "development") === "development",
};
