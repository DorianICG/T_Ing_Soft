import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config/env';
import { User } from '../../models';
import { RoleAttributes } from '../../models/Role';
import organizationAccessServiceInstance from '../services/organization-access.service';

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User> | { id: number; action?: string };
      activeOrganizationId?: number;
      effectiveRoles?: RoleAttributes[];
    }
  }
}

interface DecodedToken extends JwtPayload {
  id: number;
}


export const authenticateAndAttachUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided.' });
    return; // Ensure void return after sending response
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET as Secret) as DecodedToken;
    const userInstance = await User.findByPk(decoded.id);

    if (!userInstance) {
      res.status(403).json({ error: 'Invalid token: User not found.' });
      return; // Ensure void return
    }
    req.user = userInstance;
    next();
    // No explicit return needed here, as next() is called and the function will complete.
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ error: 'Invalid or expired token.' });
    return; // Ensure void return
  }
};

export const setActiveOrganization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || typeof req.user.id === 'undefined') {
    res.status(401).json({ error: 'User not authenticated or user ID is missing.' });
    return; // Ensure void return
  }
  const userId = req.user.id;
  const activeOrgIdHeader = req.headers['x-active-organization-id'];
  let activeOrganizationId: number | undefined;

  if (activeOrgIdHeader) {
    activeOrganizationId = parseInt(activeOrgIdHeader as string, 10);
    if (isNaN(activeOrganizationId)) {
      res.status(400).json({ error: 'Invalid x-active-organization-id header.' });
      return; // Ensure void return
    }
  }

  try {
    const result = await organizationAccessServiceInstance.determineActiveOrganizationAndRoles(userId, activeOrganizationId);

    if (!result) {
      res.status(403).json({ error: 'Access denied or no active organization found.' });
      return; // Ensure void return
    }

    req.activeOrganizationId = result.activeOrganizationId;
    req.effectiveRoles = result.effectiveRoles;
    next();
  } catch (error) {
    console.error('Error in setActiveOrganization:', error);
    res.status(500).json({ error: 'Internal server error while setting active organization.' });
    return; // Ensure void return
  }
};

export const requireRole = (requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.effectiveRoles) {
      res.status(403).json({ error: 'Access denied. No effective roles determined.' });
      return; // Ensure void return
    }

    const hasRequiredRole = req.effectiveRoles.some(role => requiredRoles.includes(role.name));

    if (!hasRequiredRole) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return; // Ensure void return
    }
    next();
  };
};