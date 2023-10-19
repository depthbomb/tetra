import QRCode from 'qrcode';
import { joinURL } from 'ufo';
import Router from '@koa/router';
import { uid } from 'uid/single';
import { koaBody } from 'koa-body';
import { database } from '@database';
import { createThrottler } from '@lib/throttle';
import { sendJsonResponse } from '@utils/response';
import { getUnusedShortcode } from '@lib/shortcode';
import { parseQuery, parseParams, parsePayload } from '@utils/request';
import {
	ShortcodePath,
	ListShortlinksQuery,
	DeleteShortlinkPath,
	CreateShortlinkBody,
	ToggleShortlinkPath,
	CreateShortlinkQuery,
	ToggleShortlinkQuery,
	SetShortlinkExpiryBody,
	SetShortlinkExpiryPath,
} from '@tetra/schema';
import type { Context } from 'koa';
import type { Prisma } from '@database';
import { parseDuration } from '@utils/duration';

export function createShortlinksV1Router() {
	const router    = new Router({ prefix: '/v1/shortlinks' });
	const throttler = createThrottler('shortlinks', 5_000, 10);

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.get('api.v1.shortlinks.list_user', '/', throttler.consume(), listUserShortlinks);
	router.get('api.v1.shortlinks.list', '/all', throttler.consume(2), listAllShortlinks);
	router.get('api.v1.shortlinks.count', '/count', throttler.consume(), countShortlinks);
	router.put('api.v1.shortlinks.create', '/', throttler.consume(2), koaBody(), createShortlink);
	router.get('api.v1.shortlinks.info', '/:shortcode', throttler.consume(), getShortlinkInfo);
	router.delete('api.v1.shortlinks.delete', '/:shortcode/:secret', throttler.consume(2), deleteShortlink);
	router.get('api.v1.shortlinks.shortcode_availability', '/:shortcode/available', throttler.consume(), getShortcodeAvailability);
	router.patch('api.v1.shortlinks.set_expiry', '/:shortcode/:secret/set_expiry', throttler.consume(), koaBody(), setShortlinkExpiry);
	router.patch('api.v1.shortlinks.toggle', '/:shortcode/toggle', throttler.consume(), toggleShortlink);
	router.get('api.v1.shortlinks.qr_code', '/:shortcode/qrcode.svg', throttler.consume(), getShortlinkQrCode);

	/*
	|--------------------------------------------------------------------------
	| Handlers
	|--------------------------------------------------------------------------
	*/

	// GET /api/v1/shortlinks
	async function listUserShortlinks(ctx: Context) {
		const { apiKey } = parseQuery(ctx, ListShortlinksQuery);
		const shortlinks = await database.shortlink.findMany({
			where: {
				disabled: false,
				user: {
					apiKey
				}
			},
			select: {
				shortcode: true,
				shortlink: true,
				destination: true,
				secret: true,
				hits: true,
				createdAt: true,
				expiresAt: true,
			}
		});

		return sendJsonResponse(ctx, shortlinks);
	}

	// GET /api/v1/shortlinks/all
	async function listAllShortlinks(ctx: Context) {
		const { apiKey } = parseQuery(ctx, ListShortlinksQuery);
		const user       = await database.user.exists({ apiKey, admin: true });

		ctx.assert(user, 403);

		const shortlinks = await database.shortlink.findMany({
			select: {
				creatorIp: true,
				shortcode: true,
				shortlink: true,
				destination: true,
				secret: true,
				disabled: true,
				hits: true,
				createdAt: true,
				expiresAt: true,
				user: {
					select: {
						username: true
					}
				}
			}
		});

		return sendJsonResponse(ctx, shortlinks);
	}

	// GET /api/v1/shortlinks/count
	async function countShortlinks(ctx: Context) {
		const count = await database.shortlink.count({
			where: {
				disabled: false
			}
		});

		return sendJsonResponse(ctx, { count });
	}

	// GET /api/v1/shortlinks/:shortcode
	async function getShortlinkInfo(ctx: Context) {
		const { shortcode } = parseParams(ctx, ShortcodePath);
		const shortlink = await database.shortlink.findFirst({
			where: {
				shortcode,
				disabled: false
			},
			select: {
				shortlink: true,
				destination: true,
				hits: true,
				createdAt: true,
				expiresAt: true,
			}
		});

		ctx.assert(shortlink, 404);

		return sendJsonResponse(ctx, shortlink);
	}

	// PUT /api/v1/shortlinks
	async function createShortlink(ctx: Context) {
		let { destination, shortcode, duration } = parsePayload(ctx, CreateShortlinkBody);
		const { apiKey }                         = parseQuery(ctx, CreateShortlinkQuery);

		let parsedDuration;
		if (duration) {
			parsedDuration = parseDuration(ctx, duration);
			ctx.assert(parsedDuration.offset >= 60_000, 400, 'Shortlink duration must be at least 1 minute in length.');
		}

		shortcode ??= await getUnusedShortcode();

		const createQuery: Prisma.ShortlinkCreateArgs = {
			data: {
				creatorIp: ctx.request.ip,
				shortcode,
				shortlink: joinURL(ctx.URL.origin, shortcode),
				destination,
				secret: uid(64),
				expiresAt: parsedDuration?.fromNow
			},
			select: {
				shortcode: true,
				shortlink: true,
				destination: true,
				secret: true,
				expiresAt: true
			}
		};

		// TODO attempt to retrieve user from cookies first?

		if (apiKey) {
			const user = await database.user.findFirst({
				where: {
					apiKey
				},
				select: {
					id: true
				}
			});

			ctx.assert(user, 400, 'Invalid API key');

			// Associate the shortlink with a user
			createQuery.data.user = { connect: { id: user.id } };
		}

		const shortlink = await database.shortlink.create(createQuery);

		return sendJsonResponse(ctx, shortlink, 201);
	}

	// DELETE /api/v1/shortlinks/:shortcode/:secret
	async function deleteShortlink(ctx: Context) {
		const { shortcode, secret } = parseParams(ctx, DeleteShortlinkPath);

		// Due to `.delete` returning a bad error if a record does not exist, we use `.deleteMany`
		// so we can get a proper response that tells us if any records were deleted. This operation
		// is safe to use because `shortcode` and `secret` are guaranteed to be unique.
		const { count } = await database.shortlink.deleteMany({
			where: {
				shortcode,
				secret
			}
		});

		ctx.assert(count > 0, 404);

		return sendJsonResponse(ctx, { success: true }, 200);
	}

	// GET /api/v1/shortlinks/:shortcode/available
	async function getShortcodeAvailability(ctx: Context) {
		const { shortcode } = parseQuery(ctx, ShortcodePath);
		const available = await database.shortlink.count({
			where: {
				shortcode
			}
		}) === 0;

		return sendJsonResponse(ctx, { available });
	}

	// PATCH /api/v1/shortlinks/:shortcode/:secret/set-expiry
	async function setShortlinkExpiry(ctx: Context) {
		const { shortcode, secret } = parseParams(ctx, SetShortlinkExpiryPath);
		const { duration }          = parsePayload(ctx, SetShortlinkExpiryBody);
		const parsedDuration        = parseDuration(ctx, duration);

		const { expiresAt } = await database.shortlink.update({
			data: {
				expiresAt: parsedDuration.fromNow
			},
			where: {
				shortcode,
				secret
			},
			select: {
				expiresAt: true
			}
		});

		return sendJsonResponse(ctx, { expiresAt });
	}

	// PATCH /api/v1/shortlinks/:shortcode/toggle
	async function toggleShortlink(ctx: Context) {
		const { shortcode } = parseParams(ctx, ToggleShortlinkPath);
		const { apiKey }    = parseQuery(ctx, ToggleShortlinkQuery);
		const user          = await database.user.findFirst({
			where: {
				apiKey,
				admin: true
			}
		});

		ctx.assert(user, 403);

		const existingShortlink = await database.shortlink.findFirst({
			where: {
				shortcode
			},
			select: {
				disabled: true
			}
		});

		ctx.assert(existingShortlink, 404);

		const { disabled } = await database.shortlink.update({
			data: {
				disabled: !existingShortlink.disabled
			},
			where: {
				shortcode
			}
		});

		return sendJsonResponse(ctx, { disabled });
	}

	// GET /api/v1/shortlinks/:shortcode/qrcode.svg
	async function getShortlinkQrCode(ctx: Context) {
		const { shortcode } = parseParams(ctx, ShortcodePath);
		const shortlink = await database.shortlink.findFirst({
			where: {
				shortcode,
				disabled: false
			},
			select: {
				destination: true
			}
		});

		ctx.assert(shortlink, 404);

		ctx.response.set('Content-Type', 'image/svg+xml');
		ctx.body = await QRCode.toString(shortlink.destination, {
			margin: 1,
			width: 256,
			color: {
				dark: '#05bef9'
			},
			type: 'svg'
		});
	}

	/*
	|--------------------------------------------------------------------------
	| Privates
	|--------------------------------------------------------------------------
	*/

	return router.routes();
}


