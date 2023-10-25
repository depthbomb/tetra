import destr from 'destr';
import { AUTH_COOKIE_NAME } from '@constants';
import { getCookie, deleteCookie } from '@utils/cookies';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that handles verifying a user by their cookie.
 *
 * @see [createLoggedInMiddleware](loggedIn.ts) for protecting routes from unauthenticated requests.
 */
export function createAuthMiddleware() {
	return async function (ctx: Context, next: Next) {
		try {
			const authCookie = getCookie(ctx, AUTH_COOKIE_NAME, { encrypted: true });
			if (authCookie) {
				ctx.state.user = destr(authCookie);
			}
		} catch (err) {
			deleteCookie(ctx, AUTH_COOKIE_NAME);
		}

		await next();
	};
}
