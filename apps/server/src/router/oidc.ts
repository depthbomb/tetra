import Router from '@koa/router';
import { uid } from 'uid/secure';
import { OAuth } from '@lib/oidc';
import { database } from '@database';
import { Duration } from '@sapphire/duration';
import { createThrottler } from '@lib/throttle';
import { createGravatar } from '@utils/gravatar';
import { setCookie, getCookie, deleteCookie } from '@utils/cookies';
import { AUTH_COOKIE_NAME, OIDC_STATE_COOKIE_NAME } from '@constants';
import { createRequireFeatureMiddleware } from '@middleware/requireFeature';
import type { Context } from 'koa';

export function createOidcRouter() {
	const router    = new Router({ prefix: '/oidc' });
	const throttler = createThrottler('oidc', 10_000, 5);

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/
	router.get('/start', createRequireFeatureMiddleware('AUTHENTICATION'), throttler.consume(2), async (ctx: Context) => {
		const authUrl = await OAuth.getAuthUrl(ctx);

		return ctx.redirect(authUrl);
	});

	router.get('/callback', createRequireFeatureMiddleware('AUTHENTICATION'), throttler.consume(2), async (ctx: Context) => {
		const cookie = getCookie(ctx, OIDC_STATE_COOKIE_NAME, { encrypted: true });

		deleteCookie(ctx, OIDC_STATE_COOKIE_NAME);

		ctx.assert(cookie, 400, 'Missing state cookie');

		const params      = OAuth.client!.callbackParams(ctx.req);
		const tokenSet    = await OAuth.client!.callback('http://localhost:3000/oidc/callback', params, { state: cookie });
		const accessToken = tokenSet.access_token;

		ctx.assert(accessToken, 403, 'access_token not found');

		const userInfo = await OAuth.client!.userinfo(accessToken);

		let existingUser = await database.user.findFirst({ where: { sub: userInfo.sub } });
		if (!existingUser) {
			existingUser = await database.user.create({
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
			sub: existingUser.sub,
			username: existingUser.username,
			avatars: {
				'x24': createGravatar(existingUser.email, { size: 24 }),
				'x32': createGravatar(existingUser.email, { size: 32 }),
			},
			admin: existingUser.admin,
			apiKey: existingUser.apiKey
		}

		setCookie(ctx, AUTH_COOKIE_NAME, JSON.stringify(cookieValue), {
			encrypt: true,
			httpOnly: true,
			expires: new Duration('6 months').fromNow
		});

		return ctx.redirect('/');
	});

	router.post('/invalidate', (ctx: Context) => {
		deleteCookie(ctx, AUTH_COOKIE_NAME);
		delete ctx.state.user;

		return ctx.redirect('/');
	});

	return router.routes();
}
