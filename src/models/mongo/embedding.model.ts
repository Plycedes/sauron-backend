import mongoose, { Schema, Document } from "mongoose";
import { UpdateCategory, UpdateConfidence } from "../../types/update.types";

export interface IEmbeddingDocument extends Document {
    updateId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    date: Date;
    category: UpdateCategory;
    confidence: UpdateConfidence;
    hoursSpent: number;
    text: string;
    embedding: number[];
    createdAt: Date;
    updatedAt: Date;
}

const EmbeddingSchema = new Schema<IEmbeddingDocument>(
    {
        updateId: { type: Schema.Types.ObjectId, ref: "DailyUpdate", required: true, unique: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
        date: { type: Date, required: true },
        category: {
            type: String,
            enum: ["feature", "bug", "review", "meeting", "research", "deployment"],
            required: true,
        },
        confidence: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
        },
        hoursSpent: { type: Number, required: true, min: 0.5, max: 12 },
        text: { type: String, required: true },
        embedding: { type: [Number], required: true, index: true }, // Atlas Vector Search index needed
    },
    { timestamps: true },
);

// Note: Atlas Vector Search index must be created manually in Atlas UI on the 'embedding' field
// Index configuration:
// - Dimensions: 1536 (for text-embedding-3-small)
// - Distance metric: cosine
// - Type: vector

export const EmbeddingModel = mongoose.model<IEmbeddingDocument>("Embedding", EmbeddingSchema);
