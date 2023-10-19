import { Features } from '@lib/features';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that requires a feature to be enabled to allow the request to go through.
 *
 * @see [Features](../lib/features.ts)
 */
export function createRequireFeatureMiddleware(featureName: string) {
	return async function(ctx: Context, next: Next) {
		ctx.assert(Features.isEnabled(featureName), 403, 'This feature is currently disabled. Please try again later.');

		await next();
	};
}
