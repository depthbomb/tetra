import type { Middleware } from 'koa';

/**
 * Creates a middleware that attempts to authenticate the current request.
 * @param {boolean} checkOnly Whether to only check for the presence of the authenticated user
 * @returns {Middleware}
 */
export function createAuthMiddleware(checkOnly = false): Middleware {
	return async (ctx, next) => {
		if (checkOnly) {
			if (!('user' in ctx) || !ctx.user) {
				ctx.throw(401, 'Unauthorized');
			}
		} else {
			// Obtaining the JWT from the request headers is prioritized, then cookie, then query string.

			const headerAuth = ctx.get('Authorization');
			const cookieAuth = ctx.cookies.get('tetraJwt');
			const queryAuth  = ctx.request.query.accessToken as string;

			let accessToken: string;
			if (headerAuth) {
				accessToken = headerAuth.replace('Bearer ', '');
			} else if (cookieAuth) {
				accessToken = cookieAuth;
			} else if (queryAuth) {
				accessToken = queryAuth;
			}

			if (accessToken) {
				const user = {}; // TODO get user info
				if (user) {
					ctx.user = user;
				}
			}
		}

		return await next();
	};
}
