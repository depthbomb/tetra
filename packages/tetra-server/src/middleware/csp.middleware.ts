import { Injectable, NestMiddleware }           from '@nestjs/common';
import { nanoid }                               from 'nanoid/non-secure';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class CspMiddleware implements NestMiddleware {
    public async use(req: Request, res: Response, next: NextFunction) {
        const nonce = nanoid(32);

        res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'; style-src 'self';`);

        return next();
    }
}
