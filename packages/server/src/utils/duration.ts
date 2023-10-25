import { Duration } from '@sapphire/duration';
import type { Context } from 'koa';

export function parseDuration(ctx: Context, input: string): Duration {
	try {
		return new Duration(input);
	} catch {
		ctx.throw(400, 'Invalid duration');
	}
}
