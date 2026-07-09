import mongoose, { Schema, Document } from 'mongoose';
import { MembershipRole } from '../../types/membership.types';

export interface IMembershipDocument extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  role: MembershipRole;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembershipDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    role: {
      type: String,
      enum: ['company_admin', 'pm', 'member'],
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

MembershipSchema.index({ userId: 1, companyId: 1 }, { unique: true });

export const MembershipModel = mongoose.model<IMembershipDocument>('Membership', MembershipSchema);
