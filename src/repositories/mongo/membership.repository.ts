import { MembershipModel } from '../../models/mongo';
import { IMembershipRepository } from '../interface/IMembershipRepository';
import { MembershipInput, MembershipResponse, MembershipRole } from '../../types/membership.types';

type LeanMembershipDoc = {
  _id: { toString(): string };
  userId: { toString(): string };
  companyId: { toString(): string };
  role: MembershipRole;
  joinedAt: Date;
};

export class MongoMembershipRepository implements IMembershipRepository {
  private toResponse(doc: LeanMembershipDoc): MembershipResponse {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      companyId: doc.companyId.toString(),
      role: doc.role,
      joinedAt: doc.joinedAt,
    };
  }

  async create(data: MembershipInput): Promise<MembershipResponse> {
    const doc = await MembershipModel.create(data);
    return this.toResponse(doc.toObject() as unknown as LeanMembershipDoc);
  }

  async findByUserAndCompany(
    userId: string,
    companyId: string,
  ): Promise<MembershipResponse | null> {
    const doc = await MembershipModel.findOne({ userId, companyId }).lean();
    if (!doc) return null;
    return this.toResponse(doc as unknown as LeanMembershipDoc);
  }

  async findAllByCompany(companyId: string): Promise<MembershipResponse[]> {
    type PopulatedUser = { _id: { toString(): string }; fullName: string };
    const docs = await MembershipModel.find({ companyId })
      .populate<{ userId: PopulatedUser }>('userId', 'fullName')
      .lean();
    return docs.map((doc) => ({
      _id: (doc._id as unknown as { toString(): string }).toString(),
      userId: doc.userId?._id.toString() ?? '',
      companyId: (doc.companyId as unknown as { toString(): string }).toString(),
      role: doc.role,
      joinedAt: doc.joinedAt,
      name: doc.userId?.fullName,
    }));
  }

  async findAllByUser(userId: string): Promise<MembershipResponse[]> {
    const docs = await MembershipModel.find({ userId }).lean();
    return docs.map((doc) => this.toResponse(doc as unknown as LeanMembershipDoc));
  }

  async updateRole(
    userId: string,
    companyId: string,
    role: MembershipRole,
  ): Promise<MembershipResponse | null> {
    const doc = await MembershipModel.findOneAndUpdate(
      { userId, companyId },
      { role },
      { returnDocument: 'after' },
    ).lean();
    if (!doc) return null;
    return this.toResponse(doc as unknown as LeanMembershipDoc);
  }

  async delete(userId: string, companyId: string): Promise<void> {
    await MembershipModel.deleteOne({ userId, companyId });
  }
}
