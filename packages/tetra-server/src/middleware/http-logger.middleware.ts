import { STATUS_CODES }                         from 'node:http';
import { performance }                          from 'perf_hooks';
import { Logger, Injectable, NestMiddleware }   from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    private readonly _logger: Logger;

    public constructor() {
        this._logger = new Logger('HTTP');
    }

    public use(req: Request, res: Response, next: NextFunction) {
        const requestId = res.getHeader('X-Request-Id');
        const start     = performance.now();

        this._logger.log(`${requestId} ${req.method} -> ${req.originalUrl}`);

        res.once('finish', () => {
            const end = performance.now() - start;
            this._logger.log(`${requestId} ${req.method} <- ${res.statusCode} ${STATUS_CODES[res.statusCode]} (<->) ${end.toFixed(3)} ms`);
        });

        next();
    }
}
