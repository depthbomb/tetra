import Router from '@koa/router';
import { createApiRouter } from '@router/api';
import { createSseRouter } from '@router/sse';
import { createRootRouter } from '@router/root';
import { createOidcRouter } from '@router/oidc';

export function createRouter() {
	const router = new Router();

	router.use(createApiRouter());
	router.use(createOidcRouter());
	router.use(createSseRouter());
	router.use(createRootRouter());
	router.all('/(.*)', ctx => {
		ctx.throw(404); // 404 anything else
	});

	return router.routes();
}
