import Router from '@koa/router';
import { Features } from '@lib/features';
import { assertAdminUser } from '@utils/users';
import { sendJsonResponse } from '@utils/response';
import { parseQuery, parseParams } from '@utils/request';
import { ListFeaturesQuery, ToggleFeaturePath } from '@tetra/schema';
import type { Context } from 'koa';

export async function createFeaturesV1Router() {
	const router = new Router({ prefix: '/v1/features' });

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.get('/', listFeatures);
	router.patch('/:name/enable', toggleFeature);
	router.patch('/:name/disable', toggleFeature);
	router.patch('/:name/toggle', toggleFeature);

	/*
	|--------------------------------------------------------------------------
	| Handlers
	|--------------------------------------------------------------------------
	*/

	async function listFeatures(ctx: Context) {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);

		await assertAdminUser(ctx, apiKey);

		return await sendJsonResponse(ctx,
			await Features.getAll()
		);
	}

	async function toggleFeature(ctx: Context) {
		const { apiKey } = parseQuery(ctx, ListFeaturesQuery);
		const { name } = parseParams(ctx, ToggleFeaturePath);

		await assertAdminUser(ctx, apiKey);

		ctx.assert(await Features.exists(name), 404);

		const oldValue = await Features.isEnabled(name);

		if (ctx.request.path.endsWith('/enable')) {
			await Features.enable(name);
		} else if (ctx.request.path.endsWith('/disable')) {
			await Features.disable(name);
		} else {
			await Features.toggle(name);
		}

		const newValue = await Features.isEnabled(name);

		return await sendJsonResponse(ctx, { old: oldValue, new: newValue });
	}

	return router.routes();
}
