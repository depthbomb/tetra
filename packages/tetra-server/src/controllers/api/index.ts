import Router from '@koa/router';
import { createLinksRoutes } from '~controllers/links';
import { createThrottleMiddleware } from '~middleware/throttleMiddleware';
import type { Middleware } from 'koa';

export function createApiRoutes(): Middleware {
	const router = new Router({ prefix: '/api' });

	// POST   /api/links/create
	// DELETE /api/links/delete/:shortcode/:deletionKey
	router.use(
		createThrottleMiddleware('1s', 2),
		createLinksRoutes()
	);

	return router.routes();
}
