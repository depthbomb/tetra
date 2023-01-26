import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import type { Request, Response, NextFunction }              from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    public async use(req: Request, res: Response, next: NextFunction) {
        if (!req.user || !('user' in req)) {
            throw new UnauthorizedException();
        }

        return next();
    }
}
