import { logger } from '@logger';
import { database } from '@database';
import { factory, detectPrng } from 'ulid';
import { Duration } from '@sapphire/duration';
import type { Next, Context } from 'koa';

export async function getThrottler(
	name: string,
	interval: string,
	limit: number = 1,
	cost: number = 1,
	addHeaders: boolean = true
): Promise<Throttler> {
	const { offset } = new Duration(interval);

	let bucket = await database.tokenBucket.findFirst({ where: { name } });
	if (!bucket) {
		const identifier = factory(detectPrng(true))();
		bucket = await database.tokenBucket.create({
			data: {
				name,
				identifier,
				limit,
				interval: offset,
				cost
			}
		});

		logger.info('Created new TokenBucket', { name, identifier, offset, limit, cost, addHeaders });
	} else {
		// Update existing token bucket in case the values may have changed.
		if (bucket.limit !== limit || bucket.interval !== offset || bucket.cost !== cost) {
			await database.tokenBucket.update({
				where: {
					identifier: bucket.identifier,
				},
				data: {
					limit,
					interval: offset,
					cost,
				},
			});
		}
	}

	return new Throttler(
		bucket.identifier,
		interval,
		bucket.limit,
		bucket.cost,
		addHeaders
	);
}

class Throttler {
	private readonly _id: string;
	private readonly _interval: string;
	private readonly _limit: number;
	private readonly _cost: number;
	private readonly _addHeaders: boolean;

	/**
	 * Creates a new throttler instance.
	 * @param id The unique identifier of this token bucket
	 * @param interval The time in milliseconds before the bucket is reset
	 * @param limit The amount that can be consumed from the bucket before being limited
	 * @param cost The default cost consumed from the bucket, can be overridden when consuming
	 * @param addHeaders Whether to add X-RateLimit-...` headers to the responses of routes that
	 * this throttler applies to, useful if you want to have multiple throttlers and not have
	 * conflicting headers
	 */
	public constructor(id: string, interval: string, limit: number = 1, cost: number = 1, addHeaders: boolean = true) {
		this._id         = id;
		this._interval   = interval;
		this._limit      = limit;
		this._cost       = cost;
		this._addHeaders = addHeaders;
	}

	public consume(cost: number = this._cost) {
		return async (ctx: Context, next: Next) => {
			const { ip: identifier } = ctx.request;
			const entries = await database.rateLimit.findMany({
				select: {
					identifier: true,
					tokens: true,
					expiresAt: true,
				},
				where: {
					identifier,
					expiresAt: { gte: new Date() }
				},
				orderBy: {
					expiresAt: 'desc'
				}
			});

			const usedTokens    = entries.reduce((a, e) => a + e.tokens, 0);
			const remaining     = Math.max(this._limit - usedTokens, 0);
			const earliestEntry = entries[entries.length - 1];
			const now           = Date.now();

			if (this._addHeaders) {
				ctx.res.setHeader('X-RateLimit-Limit', this._limit);
				ctx.res.setHeader('X-RateLimit-Cost', cost);
				ctx.res.setHeader('X-RateLimit-Remaining', Math.max(remaining - cost, 0));
				let resetTimestamp = new Duration(this._interval).fromNow.getTime();
				if (earliestEntry) {
					resetTimestamp = earliestEntry.expiresAt.getTime();
				}
				ctx.res.setHeader('X-RateLimit-Reset', Math.floor(resetTimestamp / 1_000));
				ctx.res.setHeader('X-RateLimit-Reset-After', Math.floor((resetTimestamp - now) / 1_000));
				ctx.res.setHeader('X-RateLimit-Bucket', this._id);
			}

			ctx.assert(remaining >= cost, 429);

			await database.rateLimit.create({
				data: {
					bucketIdentifier: this._id,
					identifier,
					tokens: cost,
					expiresAt: new Duration(this._interval).fromNow
				}
			});

			return next();
		};
	}
}
