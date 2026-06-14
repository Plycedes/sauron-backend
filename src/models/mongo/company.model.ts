import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyDocument extends Document {
    name: string;
    domain: string;
    adminId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CompanySchema = new Schema<ICompanyDocument>(
    {
        name: { type: String, required: true, trim: true },
        domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
        adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true },
);

export const CompanyModel = mongoose.model<ICompanyDocument>("Company", CompanySchema);
