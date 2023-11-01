import { database } from '@database';
import type { Context } from 'koa';

export async function assertAdminUser(ctx: Context, apiKey: string): Promise<void> {
	const exists = await database.user.exists({
		apiKey,
		admin: true
	});

	ctx.assert(exists, 403);
}
