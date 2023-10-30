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

		return await sendJsonResponse(ctx, { hash });
	});
	router.use(createUsersV1Router());
	router.use(createShortlinksV1Router());
	router.use(createFeaturesV1Router());
	router.get('/openapi.:extension', ctx => {
		let spec: string;
		let contentType: string;
		if (ctx.params?.extension === 'yaml') {
			contentType = 'text/yaml';
			spec        = generateSpec('yaml');
		} else {
			contentType = 'application/json';
			spec        = generateSpec('json');
		}

		ctx.response.set('Content-Type', contentType);
		ctx.body = spec;
	});

	return router.routes();
}
