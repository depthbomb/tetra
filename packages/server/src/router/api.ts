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
import { createSecurityMiddleware } from '@middleware/security';
import type { Context } from 'koa';

export async function createApiRouter() {
	const router = new Router({ prefix: '/api' });

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.use(createCorsMiddleware());
	router.all('/',createSecurityMiddleware(), createHtmlMinMiddleware(), serveSwagger);
	router.get('/app_version', appVersion);
	router.use(await createUsersV1Router());
	router.use(await createShortlinksV1Router());
	router.use(await createFeaturesV1Router());
	router.get('/openapi.:extension', openApiSpec);

	/*
	|--------------------------------------------------------------------------
	| Handlers
	|--------------------------------------------------------------------------
	*/

	async function serveSwagger(ctx: Context) {
		ctx.body = await renderView(ctx, 'api');
	}

	async function appVersion(ctx: Context) {
		const hash = await GitHash.retrieve();

		return await sendJsonResponse(ctx, { hash });
	}

	async function openApiSpec(ctx: Context) {
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
	}

	return router.routes();
}
