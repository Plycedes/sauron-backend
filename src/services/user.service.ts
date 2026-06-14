import { userRepository } from "../repositories";
import { UpdateUserInput, UserProfile } from "../types/user.types";
import { ApiError } from "../utils";

export async function getUser(id: string): Promise<UserProfile> {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<UserProfile> {
    const user = await userRepository.updateById(id, data);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
}

export async function deleteUser(id: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    await userRepository.deleteById(id);
}
