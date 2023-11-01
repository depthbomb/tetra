import { randomBytes } from 'node:crypto';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that adds various security headers to responses.
 */
export function createSecurityMiddleware() {
	return async function(ctx: Context, next: Next) {
		const nonce = randomBytes(32).toString('base64');

		ctx.state.nonce = nonce;
		ctx.response.set('Content-Security-Policy', `script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:; object-src 'none'; base-uri 'self';`);
		ctx.res.setHeader('X-Content-Type-Options', 'nosniff');
		ctx.res.setHeader('X-Frame-Options', 'deny');
		ctx.res.setHeader('X-XSS-Protection', '1; mode=block');
		ctx.res.setHeader('Feature-Policy', "accelerometer 'none';autoplay 'none';camera 'none';geolocation 'none';gyroscope 'none';magnetometer 'none';microphone 'none';payment 'none';sync-xhr 'none';");

		await next();
	};
}
