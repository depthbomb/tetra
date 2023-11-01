import Router from '@koa/router';
import { uid } from 'uid/secure';
import { logger } from '@logger';
import { OAuth } from '@lib/oidc';
import { createUrl } from '@router';
import { database } from '@database';
import { getThrottler } from '@lib/throttle';
import { Duration } from '@sapphire/duration';
import { createGravatar } from '@utils/gravatar';
import { setCookie, getCookie, deleteCookie } from '@utils/cookies';
import { AUTH_COOKIE_NAME, OIDC_STATE_COOKIE_NAME } from '@constants';
import { createRequireFeatureMiddleware } from '@middleware/requireFeature';
import type { Context } from 'koa';

export async function createOidcRouter() {
	const router    = new Router({ prefix: '/oidc' });
	const throttler = await getThrottler('oidc', '5 seconds', 5);

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/
	router.get('oidc.start', '/start', createRequireFeatureMiddleware('AUTHENTICATION'), throttler.consume(2), async (ctx: Context) => {
		const authUrl = await OAuth.getAuthUrl(ctx);

		logger.info('Authentication flow started', { authUrl });

		return ctx.redirect(authUrl);
	});

	router.get('oidc.callback', '/callback', createRequireFeatureMiddleware('AUTHENTICATION'), throttler.consume(2), async (ctx: Context) => {
		const cookie = getCookie(ctx, OIDC_STATE_COOKIE_NAME, { encrypted: true });

		deleteCookie(ctx, OIDC_STATE_COOKIE_NAME);

		ctx.assert(cookie, 400, 'Missing state cookie');

		const params      = OAuth.client!.callbackParams(ctx.req);
		const tokenSet    = await OAuth.client!.callback(createUrl('oidc.callback'), params, { state: cookie });
		const accessToken = tokenSet.access_token;

		ctx.assert(accessToken, 403, 'access_token not found');

		const userInfo = await OAuth.client!.userinfo(accessToken);

		let user = await database.user.findFirst({ where: { sub: userInfo.sub } });
		if (!user) {
			user = await database.user.create({
				data: {
					username: userInfo.preferred_username!,
					email: userInfo.email!,
					sub: userInfo.sub,
					admin: (userInfo.groups as string[]).includes('tetra_admin'),
					apiKey: uid(64)
				}
			});
		}

		const cookieValue = {
			sub: user.sub,
			username: user.username,
			avatars: {
				'x24': createGravatar(user.email, { size: 24 }),
				'x32': createGravatar(user.email, { size: 32 }),
			},
			admin: user.admin,
			apiKey: user.apiKey
		};

		setCookie(ctx, AUTH_COOKIE_NAME, JSON.stringify(cookieValue), {
			encrypt: true,
			httpOnly: true,
			expires: new Duration('6 months').fromNow
		});

		logger.info('Authenticated user', { user });

		return ctx.redirect('/');
	});

	router.post('oidc.invalidate', '/invalidate', (ctx: Context) => {
		const { user } = ctx.state;

		deleteCookie(ctx, AUTH_COOKIE_NAME);
		delete ctx.state.user;

		logger.info('Invalidated user', { user });

		return ctx.redirect('/');
	});

	return router.routes();
}
