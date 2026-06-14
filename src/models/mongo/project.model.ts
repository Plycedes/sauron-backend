import mongoose, { Schema, Document } from "mongoose";
import { ProjectStatus } from "../../types/project.types";

export interface IProjectDocument extends Document {
    name: string;
    description: string;
    companyId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    memberIds: mongoose.Types.ObjectId[];
    status: ProjectStatus;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        memberIds: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
        status: {
            type: String,
            enum: ["active", "on_hold", "completed", "archived"],
            default: "active",
        },
    },
    { timestamps: true },
);

export const ProjectModel = mongoose.model<IProjectDocument>("Project", ProjectSchema);
