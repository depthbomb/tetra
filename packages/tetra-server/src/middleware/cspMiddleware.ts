import { nanoid } from 'nanoid/async';
import type { Middleware } from 'koa';

export function createCspMiddleware(): Middleware {
	return async (ctx, next) => {
		const nonce = await nanoid(32);

		ctx.cspNonce = nonce;
		ctx.set('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}';`);

		return await next();
	};
}
