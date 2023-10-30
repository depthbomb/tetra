import { joinURL } from 'ufo';
import Router from '@koa/router';
import { BASE_URL } from '@constants';
import { createApiRouter } from '@router/api';
import { createSseRouter } from '@router/sse';
import { createRootRouter } from '@router/root';
import { createOidcRouter } from '@router/oidc';

const router = new Router();

export async function createRouter() {
	router.use(await createApiRouter());
	router.use(await createOidcRouter());
	router.use(await createSseRouter());
	router.use(await createRootRouter());
	router.all('/(.*)', ctx => {
		ctx.throw(404); // 404 anything else
	});

	return router.routes();
}

/**
 * Creates an absolute URL to a named route. Must only be called after routes have been defined.
 * @param name The name of the route
 * @param params Optional route path parameters
 * @param query Optional route query string parameters
 */
export function createUrl(name: string, params?: unknown | undefined, query?: Router.UrlOptionsQuery | undefined): string {
	const urlPath = router.url(name, params, query);
	if (typeof urlPath !== 'string') {
		throw new Error(`No route named "${name}"`);
	}

	return joinURL(BASE_URL, urlPath);
}
