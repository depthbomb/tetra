import { z } from 'zod';
import { BadRequest } from 'fejl';
import type { ZodObject } from 'zod';
import type { Middleware } from 'koa';

export function createValidatorMiddleware(schema: ZodObject<any>): Middleware {
	return async (ctx, next) => {
		try {
			await schema.parseAsync(ctx.request.body);
		} catch (err: unknown) {
			if (err instanceof z.ZodError) {
				const { fieldErrors } = err.flatten();
				const errorMessage    = Object.values(fieldErrors).flat().join('\n');

				throw new BadRequest(errorMessage);
			}
		}

		await next();
	};
}
