import Router from '@koa/router';
import { database } from '@database';
import { Features } from '@lib/features';
import { sendJsonResponse } from '@utils/response';
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

	router.get('/', async (ctx: Context) => {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);

		checkPriviledgedUser(ctx, apiKey);

		const features = await Features.getAll();

		return await sendJsonResponse(ctx, features);
	});
	router.patch('/:name/enable', async (ctx: Context) => {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);
		const { name }   = parseParams(ctx, ToggleFeaturePath);

		checkPriviledgedUser(ctx, apiKey);

		ctx.assert(await Features.exists(name), 404);

		const oldValue = await Features.isEnabled(name);

		await Features.enable(name);

		const newValue = await Features.isEnabled(name);

		return await sendJsonResponse(ctx, { old: oldValue, new: newValue });
	});
	router.patch('/:name/disable', async (ctx: Context) => {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);
		const { name }   = parseParams(ctx, ToggleFeaturePath);

		checkPriviledgedUser(ctx, apiKey);

		ctx.assert(await Features.exists(name), 404);

		const oldValue = await Features.isDisabled(name);

		await Features.disable(name);

		const newValue = await Features.isDisabled(name);

		return await sendJsonResponse(ctx, { old: oldValue, new: newValue });
	});
	router.patch('/:name/toggle', async (ctx: Context) => {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);
		const { name }   = parseParams(ctx, ToggleFeaturePath);

		checkPriviledgedUser(ctx, apiKey);

		ctx.assert(await Features.exists(name), 404);

		const oldValue = await Features.isEnabled(name);

		await Features.toggle(name);

		const newValue = await Features.isEnabled(name);

		return await sendJsonResponse(ctx, { old: oldValue, new: newValue });
	});

	/*
	|--------------------------------------------------------------------------
	| Privates
	|--------------------------------------------------------------------------
	*/

	async function checkPriviledgedUser(ctx: Context, apiKey: string): Promise<void> {
		const exists = await database.user.exists({
			apiKey,
			admin: true
		});

		ctx.assert(exists, 403);
	}

	return router.routes();
}


