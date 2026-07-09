import { CompanyInput, CompanyResponse } from '../../types/company.types';

export interface ICompanyRepository {
  findById(id: string): Promise<CompanyResponse | null>;
  findByDomain(domain: string): Promise<CompanyResponse | null>;
  findManyByIds(ids: string[]): Promise<CompanyResponse[]>;
  create(data: CompanyInput & { adminId: string }): Promise<CompanyResponse>;
}
