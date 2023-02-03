import type { Context } from 'koa';

export function apiResponse(ctx: Context, data: object, status = 200): void {
	ctx.response.status = status;
	ctx.body            = data;
}
