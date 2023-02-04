import { log } from '~logger';
import Router from '@koa/router';
import { renderView } from '~services/views';
import { createCsrfToken } from '~services/security';
import { generateVersionedAssetTag } from '~services/static';
import type { Middleware } from 'koa';

export function createRootRoutes(): Middleware {
	const router = new Router();

	// GET /
	router.get('/', async (ctx) => {
		try {
			const { cspNonce } = ctx;
			const clientJs  = await generateVersionedAssetTag('app.ts', cspNonce);
			const clientCss = await generateVersionedAssetTag('app.css');
			const csrfToken = await createCsrfToken(ctx);
			ctx.body = await renderView('spa', {
				clientJs,
				clientCss,
				csrfToken,
				cspNonce
			});
		} catch (err: unknown) {
			log.fatal('Failed to render root SPA view, likely due to not being able to retrieve a versioned asset path');
			log.fatal(err);
		}
	});

	return router.routes();
}
