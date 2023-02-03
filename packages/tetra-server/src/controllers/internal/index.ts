import Router from '@koa/router';
import { apiResponse } from '@tetra/helpers';
import { getTotalLinks } from '~services/links';
import { createCsrfMiddleware } from '~middleware/csrfMiddleware';
import type { Middleware } from 'koa';

export function createInternalRoutes(): Middleware {
	const router = new Router({ prefix: '/internal' });

	// POST /internal/links-count
	router.post('/links-count',
		createCsrfMiddleware(),
		async (ctx) => {
			const count = await getTotalLinks();

			return apiResponse(ctx, { count });
		}
	);

	// <ANY> /internal/health
	router.all('/health', async (ctx) => {
		ctx.response.status = 204;
		ctx.body            = '';
	});

	return router.routes();
}
