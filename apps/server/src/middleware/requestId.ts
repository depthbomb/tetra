import { factory, detectPrng } from 'ulid';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that generates a unique ID and attaches it to the request state and response
 * headers.
 */
export function createRequestIdMiddleware() {
	const generateId = factory(detectPrng(true));

	return async function(ctx: Context, next: Next) {
		const requestId = generateId();

		ctx.state.requestId = requestId;
		ctx.response.set('X-Request-Id', requestId);

		await next();
	};
}
