import { TooManyRequests } from 'fejl';
import { Duration } from '@sapphire/duration';
import { RateLimitManager } from '@sapphire/ratelimits';
import type { Middleware } from 'koa';

/**
 * Creates a middleware for throttling requests
 * @param time The time string before the ratelimit resets or, in the case of a leaky bucket limiter, the time before a usage is replenished
 * @param uses The number of uses within the {@link time} before being limited, setting above `1` will create a leaky bucket limiter
 *
 * @see https://github.com/sapphiredev/utilities/tree/main/packages/duration#parsing-a-duration
 * @see https://en.wikipedia.org/wiki/Token_bucket
 * @see https://en.wikipedia.org/wiki/Leaky_bucket
 */
export function createThrottleMiddleware(time: string, uses: number = 1): Middleware {
	const manager = new RateLimitManager(new Duration(time).offset, uses);
	return async (ctx, next) => {
		const rateLimit = manager.acquire(ctx.ip);

		ctx.set('X-RateLimit-Limit',     String(uses));
		ctx.set('X-RateLimit-Remaining', String(rateLimit.remaining));
		ctx.set('X-RateLimit-Reset',     String(Math.ceil(rateLimit.remainingTime / 1000)));

		TooManyRequests.assert(!rateLimit.limited);

		rateLimit.consume();

		return await next();
	}
}
