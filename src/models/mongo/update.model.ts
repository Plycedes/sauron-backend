import mongoose, { Schema, Document } from "mongoose";
import { UpdateCategory, UpdateConfidence } from "../../types/update.types";

export interface IDailyUpdateDocument extends Document {
    userId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    date: Date;
    completed: string;
    nextSteps: string;
    blockers: string;
    category: UpdateCategory;
    hoursSpent: number;
    confidence: UpdateConfidence;
    embeddingId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DailyUpdateSchema = new Schema<IDailyUpdateDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
        date: { type: Date, default: Date.now },
        completed: { type: String, required: true, minlength: 30 },
        nextSteps: { type: String, required: true, minlength: 20 },
        blockers: { type: String, required: true, default: "None" },
        category: {
            type: String,
            enum: ["feature", "bug", "review", "meeting", "research", "deployment"],
            required: true,
        },
        hoursSpent: { type: Number, required: true, min: 0.5, max: 12 },
        confidence: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
        },
        embeddingId: { type: String },
    },
    { timestamps: true },
);

export const DailyUpdateModel = mongoose.model<IDailyUpdateDocument>("DailyUpdate", DailyUpdateSchema);
