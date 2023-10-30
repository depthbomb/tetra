import type { Context } from 'koa';
import { sendJsonResponse } from '@utils/response';
import type { Nullable } from '#nullable';

export function createRemovedHandler(since: string, removedIn: string, alternative: Nullable<string> = null) {
	return async function (ctx: Context) {
		return await sendJsonResponse(ctx, {
			message: `This endpoint has been deprecated since ${since} and removed in ${removedIn}`,
			alternative
		}, 410);
	}
}
