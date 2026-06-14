import { IAuthRepository } from "./interface/IAuthRepository";
import { IUserRepository } from "./interface/IUserRepository";
import { MongoAuthRepository } from "./mongo/auth.repository";
import { MongoUserRepository } from "./mongo/user.repository";

export const authRepository: IAuthRepository = new MongoAuthRepository();
export const userRepository: IUserRepository = new MongoUserRepository();
