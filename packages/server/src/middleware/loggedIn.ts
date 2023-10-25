import type { Next, Context } from 'koa';

/**
 * Creates a middleware that will deny access to route(s) if the request is not authenticated.
 */
export function createLoggedInMiddleware() {
	return async function(ctx: Context, next: Next) {
		ctx.assert(ctx.state.user, 401);

		await next();
	};
}
