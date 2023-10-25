import { flags } from '@flags';
import { Edge } from 'edge.js';
import { resolve } from 'node:path';
import type { Context } from 'koa';

export const views = new Edge({ cache: !flags.dev });

views.mount(resolve(__dirname, '..', 'templates'));

export async function renderView(ctx: Context, name: string, state: object = {}): Promise<string> {
	const { nonce, assets, entries, preload, user } = ctx.state;
	return views.render(name, {
		nonce,
		assets,
		entries,
		preload,
		user: JSON.stringify(user ?? {}),
		...state
	});
}
