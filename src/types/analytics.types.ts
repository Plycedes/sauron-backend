import { UpdateCategory, UpdateConfidence } from "./update.types";

export interface ConfidenceBreakdown {
    low: number;
    medium: number;
    high: number;
}

export type CategoryBreakdown = Record<UpdateCategory, number>;

export interface MemberStats {
    userId: string;
    totalHours: number;
    updateCount: number;
    confidenceBreakdown: ConfidenceBreakdown;
}

export interface ProjectStatsResponse {
    projectId: string;
    companyId: string;
    totalHours: number;
    totalUpdates: number;
    categoryBreakdown: CategoryBreakdown;
    dateRange: { from: Date | null; to: Date | null };
    members: MemberStats[];
}

export interface PerProjectStats {
    projectId: string;
    totalHours: number;
    updateCount: number;
    avgConfidence: number;
}

export interface UserStatsResponse {
    userId: string;
    companyId: string;
    lastUpdateDate: Date | null;
    currentStreak: number;
    categoryBreakdown: CategoryBreakdown;
    projects: PerProjectStats[];
}

export interface ConfidenceTrendPoint {
    date: string;
    low: number;
    medium: number;
    high: number;
}

export type ConfidenceTrendResponse = ConfidenceTrendPoint[];

export interface StaleMemberResponse {
    userId: string;
    lastUpdateDate: Date | null;
    daysSinceUpdate: number;
}

export const ZERO_CATEGORY_BREAKDOWN: CategoryBreakdown = {
    feature: 0,
    bug: 0,
    review: 0,
    meeting: 0,
    research: 0,
    deployment: 0,
};

export const ZERO_CONFIDENCE: ConfidenceBreakdown = { low: 0, medium: 0, high: 0 };

