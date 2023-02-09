import { getOrThrow } from '~config';
import { verifyJwt } from '~modules/jwt';
import type { Middleware } from 'koa';
import type { IUserPayload } from '@tetra/common';

/**
 * Creates a middleware that attempts to authenticate the current request.
 * @returns {Middleware}
 */
export function createAuthMiddleware(): Middleware {
	const sessionCookieName = getOrThrow<string>('auth.sessionCookieName');

	return async (ctx, next) => {
		// Obtaining the JWT from the request headers is prioritized over cookie

		const headerAuth    = ctx.get('Authorization');
		const sessionCookie = ctx.cookies.get(sessionCookieName);

		let userJwt: string;
		if (headerAuth) {
			userJwt = headerAuth.replace('Bearer ', '');
		} else if (sessionCookie) {
			userJwt = sessionCookie;
		}

		if (userJwt) {
			const user = await verifyJwt<IUserPayload>(userJwt);
			if (user) {
				ctx.user = {
					username: user.username,
					avatar: user.avatar,
					sub: user.sub
				};
			}
		}

		return await next();
	};
}
