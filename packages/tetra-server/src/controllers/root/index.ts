import Router from '@koa/router';
import { renderView } from '~services/views';
import { createCsrfToken } from '~services/security';
import { generateVersionedAssetTag } from '~services/static';
import type { Middleware } from 'koa';

export function createRootRoutes(): Middleware {
	const router = new Router();

	// GET /
	router.get('/', async (ctx) => {
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
	});

	return router.routes();
}
