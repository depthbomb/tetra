import { Injectable, NestMiddleware }           from '@nestjs/common';
import { AuthService }                          from '~modules/auth/auth.service';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class AddUserMiddleware implements NestMiddleware {
    private readonly _auth: AuthService;

    public constructor(auth: AuthService) {
        this._auth = auth;
    }

    public async use(req: Request, res: Response, next: NextFunction) {
        /**
         * Obtaining the JWT from the request headers is prioritized, then cookie, then query string.
         */
        const { headers, cookies, query } = req;

        let accessToken: string;
        if ('authorization' in headers) {
            accessToken = headers.authorization.replace('Bearer ', '');
        } else if ('tetraJwt' in cookies) {
            accessToken = cookies.tetraJwt;
        } else if ('accessToken' in query) {
            accessToken = query.accessToken as string;
        }

        if (accessToken) {
            const user = await this._auth.getUserFromJwt(accessToken);
            if (user) {
                req.user = user;
            }
        }

        return next();
    }
}
