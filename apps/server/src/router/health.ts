import Router from '@koa/router';
import { database } from '@database';
import { createCorsMiddleware } from '@middleware/cors';
import type { Context } from 'koa';

export function createHealthRouter() {
	const router = new Router({ prefix: '/health' });

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.use(createCorsMiddleware());
	router.get('/', async (ctx: Context) => {
		try {
			await database.$queryRaw`SELECT 1`;

			ctx.response.status = 204;
			ctx.response.body = '';
		} catch {
			ctx.throw(500);
		}
	});

	return router.routes();
}


