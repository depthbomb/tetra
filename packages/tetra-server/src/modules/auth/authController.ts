import { log } from '~logger';
import Router from '@koa/router';
import { BadRequest } from 'fejl';
import { getOrThrow } from '~config';
import { signJwt } from '~modules/jwt';
import { getOrCreate } from '~modules/user';
import { Duration } from '@sapphire/duration';
import { destroy, getClient, callbackUrl, isUserInContext, createAuthorizationUrl } from './authService';
import type { Middleware } from 'koa';

export function createAuthRoutes(): Middleware {
	const logger            = log.getSubLogger({ name: 'AUTH' });
	const router            = new Router({ prefix: '/auth' });
	const sessionCookieName = getOrThrow<string>('auth.sessionCookieName');
	// const accessTokenCookieName = getOrThrow<string>('auth.accessTokenCookieName');

	// GET /auth/login
	router.get('auth.login', '/login', async (ctx) => {
		if (isUserInContext(ctx)) {
			return ctx.redirect('/');
		}

		logger.info(`${ctx.requestId}: Starting authentication flow`);

		const { url, state } = await createAuthorizationUrl('openid email profile');
		ctx.cookies.set('state', state);
		ctx.redirect(url);
	});

	router.get('auth.logout', '/logout', async (ctx) => {
		await destroy(ctx);
		ctx.redirect('/');
	});

	// GET /auth/callback
	router.get('auth.callback', '/callback', async (ctx) => {
		const client           = await getClient();
		const params           = client.callbackParams(ctx.req);
		const state            = ctx.cookies.get('state');
		const { access_token } = await client.callback(callbackUrl, params, { state });

		ctx.cookies.set('state', null);

		if (access_token) {
			const { preferred_username, email, sub } = await client.userinfo(access_token);

			logger.info(`${ctx.requestId}: Successfully authenticated as "${preferred_username}"`);

			const user        = await getOrCreate(preferred_username, email, sub);
			const userPayload = await signJwt({
				username: user.username,
				avatar: user.avatar,
				sub: user.sub
			}, '30 days');

			const cookieExpiration = new Duration('30 days').fromNow;

			ctx.cookies.set(sessionCookieName, userPayload, { expires: cookieExpiration });
			// ctx.cookies.set(accessTokenCookieName, access_token, { expires: cookieExpiration });

			return ctx.redirect('/#/dashboard');
		} else {
			throw new BadRequest();
		}
	});

	return router.routes();
}
