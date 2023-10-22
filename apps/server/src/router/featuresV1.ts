import Router from '@koa/router';
import { database } from '@database';
import { Features } from '@lib/features';
import { sendJsonResponse } from '@utils/response';
import { createCorsMiddleware } from '@middleware/cors';
import { parseQuery, parseParams } from '@utils/request';
import { ListFeaturesQuery, ToggleFeaturePath } from '@tetra/schema';
import type { Context } from 'koa';

export function createFeaturesV1Router() {
	const router = new Router({ prefix: '/v1/features' });

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.use(createCorsMiddleware());
	router.get('/', async (ctx: Context) => {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);

		checkPriviledgedUser(ctx, apiKey);

		const features = Features.getAll();

		return sendJsonResponse(ctx, Object.keys(features).map(f => ({
			name: f,
			enabled: features[f]
		})));
	});
	router.patch('/:name/enable', async (ctx: Context) => {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);
		const { name }   = parseParams(ctx, ToggleFeaturePath);

		checkPriviledgedUser(ctx, apiKey);

		ctx.assert(Features.isValid(name), 404);

		const oldValue = Features.isEnabled(name);

		Features.enable(name);

		const newValue = Features.isEnabled(name);

		return sendJsonResponse(ctx, { old: oldValue, new: newValue });
	});
	router.patch('/:name/disable', async (ctx: Context) => {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);
		const { name }   = parseParams(ctx, ToggleFeaturePath);

		checkPriviledgedUser(ctx, apiKey);

		ctx.assert(Features.isValid(name), 404);

		const oldValue = Features.isDisabled(name);

		Features.disable(name);

		const newValue = Features.isDisabled(name);

		return sendJsonResponse(ctx, { old: oldValue, new: newValue });
	});
	router.patch('/:name/toggle', async (ctx: Context) => {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);
		const { name }   = parseParams(ctx, ToggleFeaturePath);

		checkPriviledgedUser(ctx, apiKey);

		ctx.assert(Features.isValid(name), 404);

		const oldValue = Features.isEnabled(name);

		Features.toggle(name);

		const newValue = Features.isEnabled(name);

		return sendJsonResponse(ctx, { old: oldValue, new: newValue });
	});

	/*
	|--------------------------------------------------------------------------
	| Privates
	|--------------------------------------------------------------------------
	*/

	async function checkPriviledgedUser(ctx, apiKey: string): Promise<void> {
		const exists = await database.user.exists({
			apiKey,
			admin: true
		});

		ctx.assert(exists, 403);
	}

	return router.routes();
}


