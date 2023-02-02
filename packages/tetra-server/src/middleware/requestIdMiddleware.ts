import { customAlphabet }  from 'nanoid/non-secure';
import type { Middleware } from 'koa';

export function createRequestIdMiddleware(): Middleware {
	const generateId = customAlphabet('abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);
	return async (ctx, next) => {
		const requestId = generateId();

		ctx.requestId = requestId;
		ctx.set('X-Request-Id', requestId);

		return await next();
	};
}
