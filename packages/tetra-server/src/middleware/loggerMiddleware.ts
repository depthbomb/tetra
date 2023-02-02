import { log }             from '~logger';
import { STATUS_CODES }    from 'node:http';
import { performance }     from 'perf_hooks';
import { HttpException }   from '@tetra/helpers';
import type { Middleware } from 'koa';

export function createLoggerMiddleware(ignoredPaths: string[] = []): Middleware {
	const logger = log.getSubLogger({ name: 'HTTP' });
	return async (ctx, next) => {
		const { method, request, requestId } = ctx;

		if (ignoredPaths.includes(request.path)) {
			return await next();
		}

		const now = performance.now();

		logger.info(`${requestId} -> ${method} ${request.path}`);

		try {
			await next();
		} catch (err: unknown) {
			logger.fatal(err);

			let responseStatus  = 500;
			let responseMessage = STATUS_CODES[responseStatus]
			if (err instanceof HttpException) {
				responseStatus  = err.code ?? responseStatus;
				responseMessage = err.message ?? responseMessage
			}

			ctx.response.status = responseStatus;
			ctx.body = {
				status: responseStatus,
				message: responseMessage
			};
		}

		const { status } = ctx;
		const end        = (performance.now() - now).toFixed(2);

		logger.info(`${requestId} <- ${status} ${STATUS_CODES[status]} (<->) ${end}ms`);
	};
}
