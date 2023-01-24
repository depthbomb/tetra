import { STATUS_CODES }                                      from 'node:http';
import { Logger, Injectable, HttpException, NestMiddleware } from '@nestjs/common';
import { AuthService }                                       from '~modules/auth/auth.service';
import type { Request, Response, NextFunction }              from 'express';

@Injectable()
export class CsrfValidatorMiddleware implements NestMiddleware {
    private readonly _log = new Logger('CSRF');

    public constructor(private readonly _auth: AuthService) {}

    public async use(req: Request, res: Response, next: NextFunction) {
        const requestId = res.getHeader('X-Request-Id');
        const csrfToken = req.get('X-Csrf-Token');
        if (csrfToken) {
            const isValid = await this._auth.isCsrfTokenValid(csrfToken, req);
            if (isValid) {
                return next();
            }

            this._log.warn(`${requestId}: Invalid CSRF token provided for protected endpoint`);

            throw new HttpException(STATUS_CODES[412], 412);
        }

        this._log.warn(`${requestId}: Missing CSRF token provided for protected endpoint`);

        throw new HttpException(STATUS_CODES[428], 428);
    }
}
