import { InviteInput, InviteResponse, InviteStatus } from "../../types/invite.types";

export interface IInviteRepository {
    findByToken(token: string): Promise<InviteResponse | null>;
    findByEmail(email: string, companyId: string): Promise<InviteResponse | null>;
    create(data: InviteInput & { token: string; expiresAt: Date }): Promise<InviteResponse>;
    updateStatus(id: string, status: InviteStatus): Promise<void>;
}
