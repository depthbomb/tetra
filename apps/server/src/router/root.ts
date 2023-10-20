import serve from 'koa-static';
import Router from '@koa/router';
import { resolve } from 'node:path';
import { database } from '@database';
import { spaTemplate } from '@views/spa';
import { parseParams } from '@utils/request';
import { createCspMiddleware } from '@middleware/csp';
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
	router.all('index', '/', createCspMiddleware(), createHtmlMinMiddleware(), serveSpa);
	router.all('shortlink.redirect', '/:shortcode', createRequireFeatureMiddleware('SHORTLINK_REDIRECTION'), redirectShortlink);
	router.all('/go/:shortcode', createRequireFeatureMiddleware('SHORTLINK_REDIRECTION'), redirectShortlink);

	/*
	|--------------------------------------------------------------------------
	| Handlers
	|--------------------------------------------------------------------------
	*/

	// GET /
	async function serveSpa(ctx: Context) {
		const html = await spaTemplate(ctx);

		ctx.body = html;
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


