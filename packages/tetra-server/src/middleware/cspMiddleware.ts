import { createHash, randomBytes } from 'node:crypto';
import type { Middleware } from 'koa';

export function createCspMiddleware(): Middleware {
	async function generateNonce(): Promise<string> {
		const buf = randomBytes(256);
		return 'sha256-' + createHash('sha256').update(buf).digest('base64');
	}

	return async (ctx, next) => {
		const nonce = await generateNonce();

		ctx.cspNonce = nonce;
		ctx.set('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}';`);

		return await next();
	};
}
