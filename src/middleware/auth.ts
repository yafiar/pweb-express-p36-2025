import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthJwtPayload {
  sub: number; // user id
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Missing Authorization header' });

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded === 'string') {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const payload = decoded as jwt.JwtPayload;
    const subRaw = payload.sub;
    const email = payload.email as string | undefined;

    const subNum = typeof subRaw === 'string' ? Number(subRaw) : subRaw;
    if (!subNum || !email) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = { sub: subNum, email };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
