import { logger } from '@logger';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that logs requests and their responses.
 */
export function createLoggerMiddleware() {
	return async function(ctx: Context, next: Next) {
		const { ip, path, method, headers } = ctx.request;
		const { requestId: id }             = ctx.state;

		logger.info({ id, ip, headers, method, path });

		await next();

		const { status, length } = ctx.response;

		logger.info({ id, ip, method, path, status, length: length ?? 0 });
	};
}
