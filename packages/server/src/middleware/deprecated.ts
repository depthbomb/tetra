import type { Next, Context } from 'koa';

export function createDeprecatedMiddleware(removedIn: string, alternative?: string) {
	return async function (ctx: Context, next: Next) {
		ctx.set('Deprecated', `This endpoint has been deprecated and will be removed in ${removedIn}.`);
		if (alternative) {
			ctx.set('Deprecated-Alternative', alternative);
		}

		await next();
	}
}
