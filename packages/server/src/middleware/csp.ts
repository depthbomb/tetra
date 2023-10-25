import { randomBytes } from 'node:crypto';
import type { Middleware } from 'koa';

/**
 * Creates a middleware that adds Content Security Policy headers to responses.
 */
export function createCspMiddleware(): Middleware {
	return async function(ctx, next) {
		const nonce = randomBytes(32).toString('base64');

		ctx.state.nonce = nonce;
		ctx.response.set(
			'Content-Security-Policy',
			`script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:; object-src 'none'; base-uri 'self';`
		);

		await next();
	};
}
