import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key';

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    return next();
  };
};