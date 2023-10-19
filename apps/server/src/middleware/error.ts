import { flags } from '@flags';
import { logger } from '@logger';
import { sendJsonResponse } from '@utils/response';
import type { Middleware } from 'koa';

type ErrorPayload = {
	requestId: string;
	code: number;
	message: string;
	stackTrace?: string;
};

/**
 * Creates a middleware that catches errors in the pipeline and returns a standard JSON response.
 */
export function createErrorMiddleware(): Middleware {
	return async function(ctx, next) {
		try {
			await next();
		} catch (err) {
			logger.error(err);

			let error = err as Error;
			let code = 500;
			if ('statusCode' in error) {
				code = error.statusCode as number;
			}

			const requestId = ctx.state.requestId;
			const data: ErrorPayload = {
				requestId,
				code,
				message: error.message
			};

			if (flags.dev) {
				data.stackTrace = error.stack
			}

			return sendJsonResponse(ctx, data, code);
		}
	};
}
