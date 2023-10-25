import destr from 'destr';
import { Duration } from '@sapphire/duration';
import { CSRF_COOKIE_NAME } from '@constants';
import { getCookie, setCookie } from '@utils/cookies';
import type { Next, Context } from 'koa';

type CsrfMiddlewareMode = 'create' | 'validate';

/**
 * Creates a middleware that manages assigning and validating CSRF tokens.
 *
 * @param mode The "mode" in which to run this middleware. `create` generates and assigns the CSRF
 * token while `validate` validates the existing CSRF token. Typically, you'd want to apply a
 * `create` middleware before the user encounters a route that validates it.
 */
export function createCsrfMiddleware(mode: CsrfMiddlewareMode) {
	function generateCsrfToken(ctx: Context): string {
		const i = ctx.ip;
		const e = new Duration('1 hour').fromNow;
		return JSON.stringify({ i, e });
	}

	return async function(ctx: Context, next: Next) {
		if (mode === 'create') {
			const token = generateCsrfToken(ctx);

			setCookie(ctx, CSRF_COOKIE_NAME, token, { encrypt: true, expires: new Duration('1 hour').fromNow });
		} else {
			const token = getCookie(ctx, CSRF_COOKIE_NAME, { encrypted: true });

			ctx.assert(token, 428, 'Missing CSRF token');

			const json     = token;
			const { i, e } = destr<{ i: string; e: string; }>(json);

			const expires = new Date(e);

			ctx.assert(expires > new Date(), 412, 'Invalid CSRF date');
			ctx.assert(i === ctx.ip, 412, 'Invalid CSRF user');
		}

		await next();
	};
}
