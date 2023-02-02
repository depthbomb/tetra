import Router                   from '@koa/router';
import { apiResponse }          from '@tetra/helpers';
import { getTotalLinks }        from '~services/links';
import { createCsrfMiddleware } from '~middleware/csrfMiddleware';
import type { Middleware }      from 'koa';

export function createInternalRoutes(): Middleware {
	const router = new Router({ prefix: '/internal' });

	// POST /internal/links-count
	router.post('links-count', '/links-count',
		createCsrfMiddleware(),
		(async (ctx) => {
			const count = await getTotalLinks();

			return apiResponse(ctx, { count });
		})
	);

	return router.routes();
}
