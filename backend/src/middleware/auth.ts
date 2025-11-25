import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface TokenPayload {
    userId: string;
    tenantId: string;
    role: string;
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
            tenant?: { id: string; name: string };
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as TokenPayload;
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    }
};

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No API key provided' } });
    }

    const [scheme, apiKey] = authHeader.split(' ');

    if (scheme !== 'Bearer') {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid authorization scheme' } });
    }

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { apiKey },
        });

        if (!tenant) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } });
        }

        req.tenant = { id: tenant.id, name: tenant.name };
        return next();
    } catch (err) {
        console.error('Error authenticating API key:', err);
        return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
    }
};
