import { UpdateUserInput, UserProfile } from "../../types/user.types";

export type { UpdateUserInput };

export interface IUserRepository {
    findById(id: string): Promise<UserProfile | null>;
    updateById(id: string, data: UpdateUserInput): Promise<UserProfile | null>;
    deleteById(id: string): Promise<void>;
}
