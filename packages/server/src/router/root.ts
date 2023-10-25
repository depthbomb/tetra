import serve from 'koa-static';
import Router from '@koa/router';
import { resolve } from 'node:path';
import { renderView } from '@views';
import { database } from '@database';
import { Features } from '@lib/features';
import { parseParams } from '@utils/request';
import { createCspMiddleware } from '@middleware/csp';
import { createCsrfMiddleware } from '@middleware/csrf';
import { ShortlinkRedirectionPath } from '@tetra/schema';
import { createAssetsMiddleware } from '@middleware/assets';
import { createHtmlMinMiddleware } from '@middleware/htmlmin';
import { createRequireFeatureMiddleware } from '@middleware/requireFeature';
import type { Context } from 'koa';

export function createRootRouter() {
	const router    = new Router();
	const publicDir = resolve(__dirname, '..', 'public');

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.use(createAssetsMiddleware());
	router.use(serve(publicDir));
	router.all('/ready', createHealthHandler(true));
	router.all('/health', createHealthHandler(false));
	router.all('index', '/', createCspMiddleware(), createCsrfMiddleware('create'), createHtmlMinMiddleware(), serveSpa);
	router.all('shortlink.redirect', '/:shortcode', createRequireFeatureMiddleware('SHORTLINK_REDIRECTION'), redirectShortlink);
	router.all('/go/:shortcode', createRequireFeatureMiddleware('SHORTLINK_REDIRECTION'), redirectShortlink);

	/*
	|--------------------------------------------------------------------------
	| Handlers
	|--------------------------------------------------------------------------
	*/

	// ANY /ready
	// ANY /health
	function createHealthHandler(databaseCheck) {
		return async function (ctx: Context) {
			try {
				if (databaseCheck) {
					await database.$queryRaw`SELECT 1`;
				}

				ctx.response.status = 204;
				ctx.response.body = '';
			} catch {
				ctx.throw(500);
			}
		}
	}

	// GET /
	async function serveSpa(ctx: Context) {
		ctx.body = await renderView(ctx, 'spa', {
			feature: Features.getEnabled()
		});
	}

	// GET /:shortcode
	async function redirectShortlink(ctx: Context) {
		let { shortcode } = parseParams(ctx, ShortlinkRedirectionPath);
		if (shortcode.endsWith('+')) {
			return ctx.redirect(`/#/shortlink/${shortcode.slice(0, -1)}`)
		}

		const shortlink = await database.shortlink.findFirst({
			where: {
				shortcode,
				disabled: false,
			},
			select: {
				destination: true
			}
		});

		ctx.assert(shortlink, 404);

		// TODO offload operation?
		await database.shortlink.update({
			data: {
				hits: {
					increment: 1
				}
			},
			where: {
				shortcode
			}
		});

		return ctx.redirect(shortlink.destination);
	}

	/*
	|--------------------------------------------------------------------------
	| Privates
	|--------------------------------------------------------------------------
	*/

	return router.routes();
}


