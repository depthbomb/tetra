import { verifyCsrfToken } from '~services/security';
import { PreconditionFailed, PreconditionRequired } from 'fejl';
import type { Middleware } from 'koa';

export function createCsrfMiddleware(): Middleware {
	return async (ctx, next) => {
		const csrfToken = ctx.get('X-Csrf-Token');

		PreconditionRequired.assert(csrfToken);

		const isValid = await verifyCsrfToken(csrfToken, ctx);

		PreconditionFailed.assert(isValid);

		return await next();
	};
}
