export interface RagQueryInput {
    question: string;
    companyId: string;
    projectId?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface RagSource {
    updateId: string;
    userId: string;
    projectId: string;
    date: Date;
    category: string;
    text: string;
}

export interface RagQueryResult {
    answer: string;
    sources: RagSource[];
}
