import Router from '@koa/router';
import { renderView } from '@views';
import { GitHash } from '@utils/githash';
import { generateSpec } from '@tetra/openapi';
import { sendJsonResponse } from '@utils/response';
import { createUsersV1Router } from '@router/usersV1';
import { createCorsMiddleware } from '@middleware/cors';
import { createFeaturesV1Router } from '@router/featuresV1';
import { createHtmlMinMiddleware } from '@middleware/htmlmin';
import { createShortlinksV1Router } from '@router/shortlinksV1';

export function createApiRouter() {
	const router = new Router({ prefix: '/api' });

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.use(createCorsMiddleware());
	router.all('/', createHtmlMinMiddleware(), async ctx => {
		ctx.body = await renderView(ctx, 'api');
	});
	router.get('/app_version', async ctx => {
		const hash = await GitHash.retrieve();

		return sendJsonResponse(ctx, { hash });
	});
	router.use(createUsersV1Router());
	router.use(createShortlinksV1Router());
	router.use(createFeaturesV1Router());
	router.get('/openapi.:extension', ctx => {
		if (ctx.params?.extension === 'yaml') {
			ctx.response.set('Content-Type', 'text/yaml');
			ctx.body = generateSpec('yaml');
		} else {
			ctx.response.set('Content-Type', 'application/json');
			ctx.body = generateSpec('json');
		}
	});

	return router.routes();
}
