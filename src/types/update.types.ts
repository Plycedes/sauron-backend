export type UpdateCategory = "feature" | "bug" | "review" | "meeting" | "research" | "deployment";
export type UpdateConfidence = "low" | "medium" | "high";

export interface UpdateInput {
    projectId: string;
    completed: string;
    nextSteps: string;
    blockers: string;
    category: UpdateCategory;
    hoursSpent: number;
    confidence: UpdateConfidence;
}

export interface UpdateResponse {
    _id: string;
    userId: string;
    projectId: string;
    companyId: string;
    date: Date;
    completed: string;
    nextSteps: string;
    blockers: string;
    category: UpdateCategory;
    hoursSpent: number;
    confidence: UpdateConfidence;
    embeddingId?: string;
    createdAt: Date;
    updatedAt: Date;
}
