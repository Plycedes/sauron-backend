import { CompanyModel } from '../../models/mongo';
import { ICompanyRepository } from '../interface/ICompanyRepository';
import { CompanyInput, CompanyResponse } from '../../types/company.types';

type LeanCompanyDoc = {
  _id: { toString(): string };
  name: string;
  domain: string;
  adminId: { toString(): string };
  createdAt: Date;
};

export class MongoCompanyRepository implements ICompanyRepository {
  private toResponse(doc: LeanCompanyDoc): CompanyResponse {
    return {
      _id: doc._id.toString(),
      name: doc.name,
      domain: doc.domain,
      adminId: doc.adminId.toString(),
      createdAt: doc.createdAt,
    };
  }

  async findById(id: string): Promise<CompanyResponse | null> {
    const doc = await CompanyModel.findById(id).lean();
    if (!doc) return null;
    return this.toResponse(doc as unknown as LeanCompanyDoc);
  }

  async findByDomain(domain: string): Promise<CompanyResponse | null> {
    const doc = await CompanyModel.findOne({ domain: domain.toLowerCase() }).lean();
    if (!doc) return null;
    return this.toResponse(doc as unknown as LeanCompanyDoc);
  }

  async findManyByIds(ids: string[]): Promise<CompanyResponse[]> {
    const docs = await CompanyModel.find({ _id: { $in: ids } }).lean();
    return docs.map((doc) => this.toResponse(doc as unknown as LeanCompanyDoc));
  }

  async create(data: CompanyInput & { adminId: string }): Promise<CompanyResponse> {
    const doc = await CompanyModel.create({
      ...data,
      domain: data.domain.toLowerCase(),
    });
    return this.toResponse(doc.toObject() as unknown as LeanCompanyDoc);
  }
}
