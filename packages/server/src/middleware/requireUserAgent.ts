import type { Next, Context } from 'koa';

/**
 * Requires routes to have a non-empty user agent, returning an HTTP 400 if no user agent is found.
 * @param routes Routes to check, leave empty array to check all routes.
 */
export function createRequireUserAgentMiddleware(routes: string[] = []) {
	return async function (ctx: Context, next: Next) {
		const { path }       = ctx.request;
		const ua             = ctx.request.headers['user-agent'];
		const isCheckedRoute = routes.some(r => path.startsWith(r));

		if (isCheckedRoute || routes.length === 0) {
			ctx.assert(ua, 400, 'Requests must include a user agent.');
		}

		await next();
	};
}
