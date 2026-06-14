import { IAuthRepository } from "./interface/IAuthRepository";
import { IUserRepository } from "./interface/IUserRepository";
import { ICompanyRepository } from "./interface/ICompanyRepository";
import { IInviteRepository } from "./interface/IInviteRepository";
import { IProjectRepository } from "./interface/IProjectRepository";
import { IUpdateRepository } from "./interface/IUpdateRepository";
import { MongoAuthRepository } from "./mongo/auth.repository";
import { MongoUserRepository } from "./mongo/user.repository";
import { MongoCompanyRepository } from "./mongo/company.repository";
import { MongoInviteRepository } from "./mongo/invite.repository";
import { MongoProjectRepository } from "./mongo/project.repository";
import { MongoUpdateRepository } from "./mongo/update.repository";

export const authRepository: IAuthRepository = new MongoAuthRepository();
export const userRepository: IUserRepository = new MongoUserRepository();
export const companyRepository: ICompanyRepository = new MongoCompanyRepository();
export const inviteRepository: IInviteRepository = new MongoInviteRepository();
export const projectRepository: IProjectRepository = new MongoProjectRepository();
export const updateRepository: IUpdateRepository = new MongoUpdateRepository();
