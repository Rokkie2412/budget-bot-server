import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const isDev = process.env.NODE_ENV === "development";
const dbURI = isDev ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PROD;

const connectDB = (): void => {
  mongoose
    .connect(dbURI || "")
    .then(() =>
      console.log(
        `Connected to MongoDB ${isDev ? "development" : "production"} mode 🛻`,
      ),
    )
    .catch((err) => {
      console.error("❌ Failed to connect to MongoDB", err);
      return process.exit(1);
    });
}

export default connectDB;