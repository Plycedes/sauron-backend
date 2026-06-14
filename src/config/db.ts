import mongoose from "mongoose";
import env from "./env";

export const connectDB = async (): Promise<void> => {
    try {
        const uri = env.mongodbURI;
        if (!uri) throw new Error("MONGODB_URI is not defined in .env");

        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
