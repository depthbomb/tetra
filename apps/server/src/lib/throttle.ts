import { typeid } from 'typeid-js';
import { Duration } from '@sapphire/duration';
import { RateLimitManager } from '@sapphire/ratelimits';
import type { Next, Context } from 'koa';

const _limiters: { [name: string]: Throttler } = {};

export function getThrottler(name: string): Throttler {
	if (!(name in _limiters)) {
		throw new Error(`Throttler "${name}" does not exist.`);
	}

	return _limiters[name];
}

export function createThrottler(name: string, interval: number | string, limit: number = 1, cost: number = 1, addHeaders: boolean = true): Throttler {
	if (name in _limiters) {
		throw new Error(`Throttler "${name}" already exists.`);
	}

	if (typeof interval === 'string') {
		interval = new Duration(interval).offset;
	}

	const throttler = new Throttler(interval, limit, cost, addHeaders);

	_limiters[name] = throttler;

	return throttler;
}

export class Throttler {
	private readonly _bucketId: string;
	private readonly _interval: number;
	private readonly _limit: number;
	private readonly _cost: number;
	private readonly _manager: RateLimitManager;
	private readonly _addHeaders: boolean;

	/**
	 * Creates a new throttler instance.
	 * @param interval The time in milliseconds before the bucket is reset
	 * @param limit The amount that can be consumed from the bucket before being limited
	 * @param cost The default cost consumed from the bucket, can be overridden when consuming
	 * @param addHeaders Whether to add X-RateLimit-...` headers to the responses of routes that
	 * this throttler applies to, useful if you want to have multiple throttlers and not have
	 * conflicting headers
	 */
	public constructor(interval: number, limit: number = 1, cost: number = 1, addHeaders: boolean = true) {
		this._bucketId   = typeid('bucket').toString();
		this._interval   = interval;
		this._limit      = limit;
		this._cost       = cost;
		this._manager    = new RateLimitManager(this._interval, this._limit);
		this._addHeaders = addHeaders;
	}

	public consume(cost: number = this._cost) {
		return async (ctx: Context, next: Next) => {
			const { ip }                                = ctx.request;
			const limiter                               = this._manager.acquire(ip);
			const { expires, remaining, remainingTime } = limiter;
			const resetAfter                            = Math.round(remainingTime / 1000);

			ctx.state.rateLimitLimit      = this._limit;
			ctx.state.rateLimitCost       = cost;
			ctx.state.rateLimitRemaining  = remaining;
			ctx.state.rateLimitReset      = expires;
			ctx.state.rateLimitResetAfter = resetAfter;
			ctx.state.rateLimitBucket     = this._bucketId;

			if (this._addHeaders) {
				ctx.res.setHeader('X-RateLimit-Limit', this._limit);
				ctx.res.setHeader('X-RateLimit-Cost', cost);
				ctx.res.setHeader('X-RateLimit-Remaining', remaining);
				ctx.res.setHeader('X-RateLimit-Reset', expires);
				ctx.res.setHeader('X-RateLimit-Reset-After', resetAfter);
				ctx.res.setHeader('X-RateLimit-Bucket', this._bucketId);
			}

			ctx.assert(!limiter.limited, 429);

			limiter.consume();

			return next();
		};
	}
}
