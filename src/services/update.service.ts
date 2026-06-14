import { updateRepository } from "../repositories";
import { ProjectModel, UserModel, EmbeddingModel } from "../models/mongo";
import { ApiError } from "../utils/ApiError";
import { UpdateInput, UpdateResponse } from "../types/update.types";
import { openaiService } from "../microservices";

export async function submitUpdate(input: UpdateInput, userId: string): Promise<UpdateResponse> {
    const project = await ProjectModel.findById(input.projectId).lean();
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const memberIds = project.memberIds.map((id) => id.toString());
    if (!memberIds.includes(userId)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaysUpdates = await updateRepository.findByUser(userId, input.projectId, startOfToday, endOfToday);
    if (todaysUpdates.length > 0) {
        throw new ApiError(409, "You have already submitted an update for this project today");
    }

    const user = await UserModel.findById(userId).lean();
    if (!user || !user.companyId) {
        throw new ApiError(403, "User is not associated with a company");
    }

    const created = await updateRepository.create({
        ...input,
        userId,
        companyId: user.companyId.toString(),
        embeddingId: undefined,
    });

    embedUpdate(created).catch((err) => {
        console.error("embedUpdate failed:", err);
    });

    return created;
}

export async function embedUpdate(update: UpdateResponse): Promise<void> {
    try {
        const dateStr = new Date(update.date).toISOString().split("T")[0];
        const text = `[${dateStr} | ${update.category} | ${update.confidence} confidence | ${update.hoursSpent}h]
Completed: ${update.completed}
Next: ${update.nextSteps}
Blockers: ${update.blockers}`;

        const embedding = await openaiService.embed(text);

        const stored = await EmbeddingModel.create({
            updateId: update._id,
            userId: update.userId,
            projectId: update.projectId,
            companyId: update.companyId,
            date: update.date,
            category: update.category,
            confidence: update.confidence,
            hoursSpent: update.hoursSpent,
            text,
            embedding,
        });

        await updateRepository.setEmbeddingId(update._id, stored._id.toString());
    } catch (err) {
        console.error("embedUpdate failed:", err);
    }
}

export async function getUpdatesByProject(
    projectId: string,
    requestingUserId: string,
    from?: Date,
    to?: Date,
): Promise<UpdateResponse[]> {
    const requester = await UserModel.findById(requestingUserId).lean();
    if (!requester) {
        throw new ApiError(404, "Requesting user not found");
    }

    const project = await ProjectModel.findById(projectId).lean();
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!requester.companyId || requester.companyId.toString() !== project.companyId.toString()) {
        throw new ApiError(403, "You can only view updates for projects in your own company");
    }

    const isManager = requester.role === "pm" || requester.role === "company_admin";
    const isMember = project.memberIds.some((id) => id.toString() === requestingUserId);

    if (!isManager && !isMember) {
        throw new ApiError(403, "You are not authorized to view updates for this project");
    }

    return updateRepository.findByProject(projectId, from, to);
}

export async function getUpdatesByUser(
    targetUserId: string,
    requestingUserId: string,
    projectId?: string,
    from?: Date,
    to?: Date,
): Promise<UpdateResponse[]> {
    const requester = await UserModel.findById(requestingUserId).lean();
    if (!requester) {
        throw new ApiError(404, "Requesting user not found");
    }

    const isManager = requester.role === "pm" || requester.role === "company_admin";
    const isSelf = targetUserId === requestingUserId;

    if (!isManager && !isSelf) {
        throw new ApiError(403, "You can only view your own updates unless you are a PM or admin");
    }

    return updateRepository.findByUser(targetUserId, projectId, from, to);
}
