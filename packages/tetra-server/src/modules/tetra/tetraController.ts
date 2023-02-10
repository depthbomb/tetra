import { log } from '~logger';
import { NotFound } from 'fejl';
import Router from '@koa/router';
import { createCsrfToken } from '~modules/security';
import { getRedirectionInfo } from '~modules/links';
import { createCspNonceMiddleware } from '@depthbomb/middleware';
import { renderView, generateVersionedAssetTag } from '~modules/views';
import type { Middleware } from 'koa';

export function createRootRoutes(): Middleware {
	const router = new Router();

	// GET /
	router.get('root', '/', createCspNonceMiddleware(), async (ctx) => {
		try {
			const { cspNonce } = ctx;
			const clientJs  = await generateVersionedAssetTag('app.ts', cspNonce);
			const clientCss = await generateVersionedAssetTag('app.css');
			const csrfToken = await createCsrfToken(ctx);
			const user      = JSON.stringify(ctx.user ?? {});
			ctx.body = await renderView('spa', {
				clientJs,
				clientCss,
				csrfToken,
				cspNonce,
				user
			});
		} catch (err: unknown) {
			log.fatal('Failed to render root SPA view, likely due to not being able to retrieve a versioned asset path');
			log.fatal(err);
		}
	});

	// <ANY> /:shortcode
	router.all('links.root', '/:shortcode', async (ctx) => {
		const { shortcode } = ctx.params;
		const info          = await getRedirectionInfo(shortcode);

		NotFound.assert(info);

		return ctx.response.redirect(info.destination);
	});

	return router.routes();
}
