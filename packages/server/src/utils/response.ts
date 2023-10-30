import { Features } from '@lib/features';
import type { Context } from 'koa';

export async function sendJsonResponse(ctx: Context, data: unknown, statusCode: number = 200): Promise<void> {
	ctx.response.status = statusCode;
	ctx.response.set('Content-Type', 'application/json');
	ctx.response.body = await jsonEncode(data);
}

async function jsonEncode(data: unknown): Promise<string> {
	const featureEnabled = await Features.isEnabled('PRETTY_PRINT_JSON');

	return JSON.stringify(data, null, featureEnabled ? 4 : 0);
}
