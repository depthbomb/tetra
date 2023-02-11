import { joinURL } from 'ufo';
import Router from '@koa/router';
import { getOrThrow } from '~config';
import { apiResponse } from '@tetra/helpers';
import { isUserInContext } from '~modules/auth';
import { createCsrfMiddleware } from '~middleware/csrfMiddleware';
import { getTotalLinks, getLinksByCreator } from '~modules/links';
import type { Middleware } from 'koa';

export function createInternalRoutes(): Middleware {
	const router  = new Router({ prefix: '/internal' });
	const baseUrl = getOrThrow<string>('web.url');

	// POST /internal/links-count
	router.post('internal.links-count', '/links-count',
		createCsrfMiddleware(),
		async (ctx) => {
			const count = await getTotalLinks();

			return apiResponse(ctx, { count });
		}
	);

	// POST /internal/get-user-links
	router.post('internal.links-count', '/get-user-links',
		createCsrfMiddleware(),
		async (ctx) => {
			const { sub } = ctx.user;
			const links = await getLinksByCreator(sub);
			const userLinks = links.map(link => ({
				shortcode: link.shortcode,
				shortlink: joinURL(baseUrl, link.shortcode),
				destination: link.destination,
				expiresAt: link.expiresAt,
				deletionKey: link.deletionKey,
				createdAt: link.createdAt
			}));

			return apiResponse(ctx, userLinks);
		}
	);

	// POST /internal/checkpoint
	router.post('internal.checkpoint', '/checkpoint',
		createCsrfMiddleware(),
		async (ctx) => {
			const auth = isUserInContext(ctx);
			return apiResponse(ctx, { auth });
		}
	);

	// <ANY> /internal/health
	router.all('internal.health', '/health', async (ctx) => {
		ctx.response.status = 204;
		ctx.body            = '';
	});

	return router.routes();
}
