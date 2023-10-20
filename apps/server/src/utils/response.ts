import { Features } from '@lib/features';
import type { Context } from 'koa';

export function sendJsonResponse(ctx: Context, data: unknown, statusCode: number = 200): void {
	ctx.response.status = statusCode;
	ctx.response.set('Content-Type', 'application/json');

	if (Features.isEnabled('PRETTY_PRINT_JSON')) {
		data = JSON.stringify(data, null, 4);
	}

	ctx.response.body = data;
}
