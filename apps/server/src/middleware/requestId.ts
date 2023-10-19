import { typeid } from 'typeid-js';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that generates a unique ID and attaches it to the request state and response
 * headers.
 */
export function createRequestIdMiddleware() {
	return async function(ctx: Context, next: Next) {
		const requestId = typeid('req').toString();

		ctx.state.requestId = requestId;
		ctx.response.set('X-Request-Id', requestId);

		await next();
	};
}
