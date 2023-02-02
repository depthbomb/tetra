import { log }             from '~logger';
import { errorResponse }   from '@tetra/helpers';
import { verifyCsrfToken } from '~services/security';
import type { Middleware } from 'koa';

export function createCsrfMiddleware(): Middleware {
	const logger = log.getSubLogger({ name: 'CSRF' });
	return async (ctx, next) => {
		const { requestId } = ctx;
		const csrfToken     = ctx.get('X-Csrf-Token');
		if (csrfToken) {
			const isValid = await verifyCsrfToken(csrfToken, ctx);
			if (isValid) {
				return await next();
			}

			logger.error('Invalid CSRF token for request', requestId);

			return errorResponse(ctx, 412, 'Invalid CSRF token');
		}

		logger.error('Missing CSRF token for', requestId);

		return errorResponse(ctx, 428, 'Missing CSRF token');
	};
}
