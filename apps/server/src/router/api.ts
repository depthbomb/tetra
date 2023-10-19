import Router from '@koa/router';
import { generateSpec } from '@tetra/openapi';
import { swaggerTemplate } from '@views/swagger';
import { createUsersV1Router } from '@router/usersV1';
import { createCorsMiddleware } from '@middleware/cors';
import { createShortlinksV1Router } from '@router/shortlinksV1';

export function createApiRouter() {
	const router = new Router({ prefix: '/api' });

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.get('/docs', async ctx => {
		const html = await swaggerTemplate(ctx);

		ctx.body = html;
	});
	router.use(createCorsMiddleware());
	router.use(createUsersV1Router());
	router.use(createShortlinksV1Router());
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
