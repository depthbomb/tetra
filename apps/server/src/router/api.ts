import Router from '@koa/router';
import { promisify } from 'node:util';
import { generateSpec } from '@tetra/openapi';
import { swaggerTemplate } from '@views/swagger';
import { exec as $exec } from 'node:child_process';
import { sendJsonResponse } from '@utils/response';
import { createUsersV1Router } from '@router/usersV1';
import { createCorsMiddleware } from '@middleware/cors';
import { createFeaturesV1Router } from '@router/featuresV1';
import { createHtmlMinMiddleware } from '@middleware/htmlmin';
import { createShortlinksV1Router } from '@router/shortlinksV1';

export function createApiRouter() {
	const router = new Router({ prefix: '/api' });
	const exec   = promisify($exec);

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.all('/', createHtmlMinMiddleware(), async ctx => {
		console.log('api')

		const html = await swaggerTemplate(ctx);

		ctx.body = html;
	});
	router.get('/app_version', async ctx => {
		const { stdout } = await exec('git rev-parse --short HEAD');
		const hash       = stdout.trim();

		return sendJsonResponse(ctx, { hash });
	});
	router.use(createCorsMiddleware());
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
