import { Request, Response, NextFunction } from 'express';
import { jwt, ApiError } from '../utils';
import { MembershipRole } from '../types/membership.types';
import { membershipRepository } from '../repositories';

export interface AuthRequest extends Request {
  userId?: string;
  companyId?: string;
  companyRole?: MembershipRole;
}

const ROLE_RANK: Record<MembershipRole, number> = {
  member: 0,
  pm: 1,
  company_admin: 2,
};

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verifyAccessToken(token);
    req.userId = decoded.userId;
    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
}

export function requireCompanyMember(minRole: MembershipRole = 'member') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    (async () => {
      const companyId = req.params.companyId as string;
      if (!companyId) {
        throw new ApiError(400, 'Missing companyId in route params');
      }

      const membership = await membershipRepository.findByUserAndCompany(req.userId!, companyId);
      if (!membership) {
        throw new ApiError(403, 'Not a member of this company');
      }

      if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
        throw new ApiError(403, 'Insufficient role');
      }

      req.companyId = companyId as string;
      req.companyRole = membership.role;
      next();
    })().catch(next);
  };
}
