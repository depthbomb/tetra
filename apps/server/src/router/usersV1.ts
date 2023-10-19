import koaBody from 'koa-body';
import Router from '@koa/router';
import { uid } from 'uid/secure';
import { database } from '@database';
import { setCookie } from '@utils/cookies';
import { AUTH_COOKIE_NAME } from '@constants';
import { Duration } from '@sapphire/duration';
import { createThrottler } from '@lib/throttle';
import { createGravatar } from '@utils/gravatar';
import { sendJsonResponse } from '@utils/response';
import { parseQuery, parsePayload } from '@utils/request';
import { ListUsersQuery, ApiKeyInfoQuery, RegenerateApiKeyBody } from '@tetra/schema';
import type { Context } from 'koa';

export function createUsersV1Router() {
	const router = new Router({ prefix: '/v1/users' });
	const throttler = createThrottler('users', 5_000, 10);

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.get('api.v1.users.list', '/', throttler.consume(), listUsers);
	router.get('api.v1.users.api_key_info', '/api_key_info', throttler.consume(), getApiKeyInfo);
	router.post('api.v1.users.regenerate_api_key', '/regenerate_api_key', throttler.consume(5), koaBody(), regenerateApiKey);

	/*
	|--------------------------------------------------------------------------
	| Handlers
	|--------------------------------------------------------------------------
	*/

	async function listUsers(ctx: Context) {
		const { apiKey } = parseQuery(ctx, ListUsersQuery);
		const user = await database.user.findFirst({
			where: {
				apiKey,
				admin: true
			}
		});

		ctx.assert(user, 403);

		const users = await database.user.findMany({
			select: {
				username: true,
				email: true,
				admin: true,
			}
		});

		return sendJsonResponse(ctx, users.map(u => ({
			...u,
			avatar: createGravatar(u.email, { size: 128 })
		})));
	}

	async function getApiKeyInfo(ctx: Context) {
		const { apiKey } = parseQuery(ctx, ApiKeyInfoQuery);
		const user       = await database.user.findFirst({
			where: {
				apiKey
			},
			select: {
				nextApiKey: true
			}
		});

		ctx.assert(user, 400, 'Invalid API key');

		const now                 = new Date();
		const nextApiKeyAvailable = user.nextApiKey;
		const canRegenerate       = now >= nextApiKeyAvailable;

		return sendJsonResponse(ctx, { canRegenerate, nextApiKeyAvailable });
	}

	async function regenerateApiKey(ctx: Context) {
		const { apiKey } = parsePayload(ctx, RegenerateApiKeyBody);
		const user       = await database.user.findFirst({
			where: {
				apiKey
			},
			select: {
				nextApiKey: true
			}
		});

		ctx.assert(user, 400, 'Invalid API key');

		const now = new Date();

		ctx.assert(now >= user.nextApiKey, 403);

		const result = await database.user.update({
			data: {
				apiKey: uid(64),
				nextApiKey: new Duration('2 hours').fromNow
			},
			where: {
				apiKey
			},
			select: {
				apiKey: true
			}
		});

		// Re-set the auth cookie if the API key is regenerated through the client.
		if ('user' in ctx.state) {
			let userObj = ctx.state.user;

			userObj.apiKey = result.apiKey;

			setCookie(ctx, AUTH_COOKIE_NAME, JSON.stringify(userObj), {
				encrypt: true,
				httpOnly: true,
				expires: new Duration('6 months').fromNow
			});
		}

		return sendJsonResponse(ctx, { apiKey: result.apiKey });
	}

	return router.routes();
}


