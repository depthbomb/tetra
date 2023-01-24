import { Injectable, NestMiddleware }           from '@nestjs/common';
import { nanoid }                               from 'nanoid/non-secure';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {

    public constructor() {}

    public async use(req: Request, res: Response, next: NextFunction) {
        const requestId = nanoid(6);

        res.setHeader('X-Request-Id', requestId);

        return next();
    }
}
