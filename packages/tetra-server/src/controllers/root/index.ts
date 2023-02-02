import Router                        from '@koa/router';
import { renderView }                from '~services/views';
import { generateVersionedAssetTag } from '~services/static';
import { createCsrfToken }           from '~services/security';
import type { Middleware }           from 'koa';

export function createRootRoutes(): Middleware {
	const rootRouter     = new Router();

	// GET /
	rootRouter.get('root', '/', async (ctx) => {
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

	return rootRouter.routes();
}
