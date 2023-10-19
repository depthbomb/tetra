import type { Context } from 'koa';

export function sendJsonResponse(ctx: Context, data: unknown, statusCode: number = 200): void {
	ctx.response.status = statusCode;
	ctx.response.set('Content-Type', 'application/json');
	ctx.response.body = data;
}
