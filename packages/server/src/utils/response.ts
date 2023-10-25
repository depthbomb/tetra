import { Features } from '@lib/features';
import type { Context } from 'koa';

export function sendJsonResponse(ctx: Context, data: unknown, statusCode: number = 200): void {
	ctx.response.status = statusCode;
	ctx.response.set('Content-Type', 'application/json');
	ctx.response.body = jsonEncode(data);
}

function jsonEncode(data: unknown): string {
	return JSON.stringify(data, null, Features.isEnabled('PRETTY_PRINT_JSON') ? 4 : 0);
}
