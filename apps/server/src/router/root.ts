import serve from 'koa-static';
import Router from '@koa/router';
import { database } from '@database';
import { spaTemplate } from '@views/spa';
import { parseParams } from '@utils/request';
import { PUBLIC_DIR } from '@tetra/shared/paths';
import { createCspMiddleware } from '@middleware/csp';
import { ShortlinkRedirectionPath } from '@tetra/schema';
import { createAssetsMiddleware } from '@middleware/assets';
import type { Context } from 'koa';

export function createRootRouter() {
	const router = new Router();

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.use(createAssetsMiddleware());
	router.use(serve(PUBLIC_DIR));
	router.all('index', '/', createCspMiddleware(), serveSpa);
	router.all('shortlink.redirect', '/:shortcode', redirectShortlink);
	router.all('/go/:shortcode', redirectShortlink);

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


