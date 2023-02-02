import { STATUS_CODES } from 'node:http';
import type { Context } from 'koa';

export function apiResponse(ctx: Context, data: Object, status = 200): void {
	ctx.response.status = status;
	ctx.body            = data;
}

export function errorResponse(ctx: Context, status: number, message?: string): void {
	ctx.response.status = status;
	ctx.body            = {
		status,
		message: message ?? STATUS_CODES[status]
	};
}
