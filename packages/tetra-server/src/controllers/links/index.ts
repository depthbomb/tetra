import koaBody from 'koa-body';
import Router from '@koa/router';
import { apiResponse } from '@tetra/helpers';
import { Duration } from '@sapphire/duration';
import { BadRequest, GeneralError, NotFound } from 'fejl';
import { CreateLinkBody } from '~common/schemas/createLinkBody';
import { UnsafeUrlException } from '~common/exceptions/UnsafeUrlException';
import { createLink, deleteLink, isDurationValid, getRedirectionInfo } from '~services/links';
import type { Middleware } from 'koa';

export function createLinksRoutes(): Middleware {
	const router = new Router({ prefix: '/links' });

	// GET /links/info/:shortcode
	router.get('/info/:shortcode', async (ctx) => {
		const { shortcode } = ctx.params;
		const info          = await getRedirectionInfo(shortcode);

		NotFound.assert(info);

		return apiResponse(ctx, info);
	});

	// POST /links/create
	router.post('/create',
		koaBody(),
		async (ctx) => {
			const { destination, duration, expiresAt } = await CreateLinkBody.parseAsync(ctx.request.body);

			let linkExpiresAt: Date = null;

			if (duration) {
				BadRequest.assert(isDurationValid(duration), 'duration is invalid, valid values are derived from https://github.com/vercel/ms#examples');

				const msDuration = new Duration(duration);

				BadRequest.assert(msDuration.offset >= 60_000, 'duration must have a minimum value of 1 minute (1m)');

				linkExpiresAt = msDuration.fromNow;
			}

			// inclusion of `expiresAt` overrides `duration`
			if (expiresAt) {
				linkExpiresAt = new Date(expiresAt);
				const differenceMs = (linkExpiresAt.getTime() - Date.now());

				BadRequest.assert(differenceMs >= 60_000, 'duration must have a minimum value of 1 minute (1m)');
			}

			try {
				const link = await createLink(ctx.ip, destination, linkExpiresAt);
				return apiResponse(ctx, {
					shortcode: link.shortcode,
					destination: link.destination,
					deletionKey: link.deletionKey,
					expiresAt: link.expiresAt,
				});
			} catch (err: unknown) {
				if (err instanceof UnsafeUrlException) {
					throw new BadRequest('The provided destination URL is classified as an unsafe URL.');
				} else {
					throw new GeneralError('Failed to create link')
				}
			}
		}
	);

	// DELETE /links/delete/:shortcode/:deletionKey
	router.delete('/delete/:shortcode/:deletionKey', async (ctx) => {
		const { shortcode, deletionKey } = ctx.params
		await deleteLink(shortcode, deletionKey);
		return apiResponse(ctx, {});
	});

	return router.routes();
}

export function createLinkRedirectionRoute(): Middleware {
	const router = new Router();

	// <ANY> /:shortcode
	router.all('/:shortcode', async (ctx) => {
		const { shortcode } = ctx.params;
		const info          = await getRedirectionInfo(shortcode);

		NotFound.assert(info);

		return ctx.response.redirect(info.destination);
	});

	return router.routes();
}
