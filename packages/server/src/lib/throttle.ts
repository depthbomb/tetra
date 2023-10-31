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
	let bucket = await database.tokenBucket.findFirst({ where: { name } });
	if (!bucket) {
		const identifier = factory(detectPrng(true))();
		const { offset } = new Duration(interval);
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

			const numEntries   = entries.length;
			const remaining    = Math.max(this._limit - numEntries, 0);
			const earliesEntry = entries[entries.length - 1];
			const now          = Date.now();

			if (this._addHeaders) {
				ctx.res.setHeader('X-RateLimit-Limit', this._limit);
				ctx.res.setHeader('X-RateLimit-Cost', cost);
				ctx.res.setHeader('X-RateLimit-Remaining', Math.max(remaining - cost, 0));
				let resetTimestamp = new Duration(this._interval).fromNow.getTime();
				if (earliesEntry) {
					resetTimestamp = earliesEntry.expiresAt.getTime();
				}
				ctx.res.setHeader('X-RateLimit-Reset', Math.floor(resetTimestamp / 1_000));
				ctx.res.setHeader('X-RateLimit-Reset-After', Math.floor((resetTimestamp - now) / 1_000));
				ctx.res.setHeader('X-RateLimit-Bucket', this._id);
			}

			ctx.assert(remaining >= cost, 429);

			const expiresAt = new Duration(this._interval).fromNow;

			// TODO maybe add a value to rate limit records instead of adding multiple records in
			// one go?
			for (let c = 0; c < cost; c++) {
				await database.rateLimit.create({
					data: {
						bucketIdentifier: this._id,
						identifier,
						expiresAt
					}
				});
			}

			return next();
		};
	}
}
