import { Features } from '@lib/features';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that adds info about application features to the request context.
 */
export function createFeaturesMiddleware() {
	return async function(ctx: Context, next: Next) {
		ctx.state.features         = Features.getAll();
		ctx.state.enabledFeatures  = Features.getEnabled();
		ctx.state.disabledFeatures = Features.getDisabled();

		await next();
	};
}
