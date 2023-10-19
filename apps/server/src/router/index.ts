import Router from '@koa/router';
import { createApiRouter } from '@router/api';
import { createRootRouter } from '@router/root';
import { createOidcRouter } from '@router/oidc';
import { createHealthRouter } from '@router/health';

export function createRouter() {
	const router = new Router();

	router.use(createApiRouter());
	router.use(createHealthRouter());
	router.use(createOidcRouter());
	router.use(createRootRouter());
	router.all('/(.*)', ctx => {
		ctx.throw(404); // 404 anything else
	});

	return router.routes();
}
