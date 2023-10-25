import type { Next, Context } from 'koa';

/**
 * Creates a middleware that adds CORS headers.
 */
export function createCorsMiddleware() {
	return async function(ctx: Context, next: Next) {
		ctx.response.set('Access-Control-Allow-Origin', '*');

		await next();
	};
}
