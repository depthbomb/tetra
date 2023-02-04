import { log } from '~logger';
import { performance } from 'perf_hooks';
import { STATUS_CODES } from 'node:http';
import type { Middleware } from 'koa';

export function createLoggerMiddleware(): Middleware {
	const logger = log.getSubLogger({ name: 'HTTP' });
	return async (ctx, next) => {
		const { method, request, requestId } = ctx;
		const now                            = performance.now();

		logger.info(`${requestId} --> ${method} ${request.path}`);

		try {
			await next();
		} catch (err: any) {
			let responseStatus  = 500;
			let responseMessage = STATUS_CODES[responseStatus];
			if ('statusCode' in err) {
				responseStatus  = err.statusCode;
				responseMessage = err.message ?? STATUS_CODES[err.statusCode]
			} else {
				/**
				 * While not bulletproof, we only check if the error we caught is a fejl-based HTTP
				 * error by checking if it has the `statusCode` property. Since these errors are
				 * non-critical, we only log the error if it appears that it isn't one of these HTTP
				 * errors.
				 */
				logger.error(err);
			}

			ctx.response.status = responseStatus;
			ctx.body = {
				status: responseStatus,
				message: responseMessage
			};
		}

		const { status } = ctx;
		const end        = (performance.now() - now).toFixed(2);

		logger.info(`${requestId} <-- ${status} ${STATUS_CODES[status]} (<-->) ${end}ms`);
	};
}
