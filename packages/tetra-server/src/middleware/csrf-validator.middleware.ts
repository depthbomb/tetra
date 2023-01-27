import { STATUS_CODES }                                                                   from 'node:http';
import { Logger, Injectable, HttpException, NestMiddleware, PreconditionFailedException } from '@nestjs/common';
import { AuthService }                                                                    from '~modules/auth/auth.service';
import type { Request, Response, NextFunction }              from 'express';

@Injectable()
export class CsrfValidatorMiddleware implements NestMiddleware {
    private readonly _auth: AuthService;
    private readonly _logger: Logger;

    public constructor(auth: AuthService) {
        this._auth   = auth;
        this._logger = new Logger('CSRF');
    }

    public async use(req: Request, res: Response, next: NextFunction) {
        const requestId = res.getHeader('X-Request-Id');
        const csrfToken = req.get('X-Csrf-Token');
        if (csrfToken) {
            const isValid = await this._auth.isCsrfTokenValid(csrfToken, req);
            if (isValid) {
                return next();
            }

            this._logger.warn(`${requestId}: Invalid CSRF token provided for protected endpoint`);

            throw new PreconditionFailedException();
        }

        this._logger.warn(`${requestId}: Missing CSRF token provided for protected endpoint`);

        throw new HttpException(STATUS_CODES[428], 428);
    }
}
