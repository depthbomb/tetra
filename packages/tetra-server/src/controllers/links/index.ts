import koaBody                 from 'koa-body';
import Router                  from '@koa/router';
import type { Middleware }     from 'koa';

export function createLinksRoutes(): Middleware {
	const router = new Router({ prefix: '/links' });

	// POST /links/create
	router.post('create-link', '/create', koaBody(), async (ctx) => {
		const { destination } = ctx.request.body;
		console.log(destination);
		// TODO
	});

	return router.routes();
}
