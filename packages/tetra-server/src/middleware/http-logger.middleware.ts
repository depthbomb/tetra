import { STATUS_CODES }                         from 'node:http';
import { performance }                          from 'perf_hooks';
import { Logger, Injectable, NestMiddleware }   from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    private readonly _logger: Logger;
    private readonly _excludedPaths: string[];

    public constructor() {
        this._logger = new Logger('HTTP');
        this._excludedPaths = [
            '/api/internal/links-count'
        ];
    }

    public use(req: Request, res: Response, next: NextFunction) {
        const { user, method, originalUrl } = req;
        // Don't log to some paths that may spam the stdout
        if (!this._excludedPaths.includes(originalUrl)) {
            const requestId               = res.getHeader('X-Request-Id');
            const start                   = performance.now();

            this._logger.log(`${requestId} ${method} -> ${originalUrl} (as ${user ? user.username : 'anonymous'})`);

            res.once('finish', () => {
                const { statusCode } = res;
                const end = performance.now() - start;
                this._logger.log(`${requestId} ${method} <- ${statusCode} ${STATUS_CODES[statusCode]} (<->) ${end.toFixed(2)} ms`);
            });
        }

        next();
    }
}
