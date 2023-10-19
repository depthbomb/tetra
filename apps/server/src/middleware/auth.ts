import destr from 'destr';
import { getCookie } from '@utils/cookies';
import { AUTH_COOKIE_NAME } from '@constants';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that handles verifying a user by their cookie.
 *
 * @see [createLoggedInMiddleware](loggedIn.ts) for protecting routes from unauthenticated requests.
 */
export function createAuthMiddleware() {
	return async function (ctx: Context, next: Next) {
		const authCookie = getCookie(ctx, AUTH_COOKIE_NAME, { encrypted: true });
		if (!authCookie) {
			delete ctx.state.user;
		} else {
			ctx.state.user = destr(authCookie);
		}

		await next();
	};
}
