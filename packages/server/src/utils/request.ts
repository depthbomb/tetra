import { z } from 'zod';
import type { Context } from 'koa';

export function parsePayload<S extends z.AnyZodObject>(ctx: Context, schema: S): z.infer<S> {
	// @ts-ignore
	const { body } = ctx.request;

	ctx.assert(body, 400);

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		const message = formatZodErrors(parsed.error);

		ctx.throw(400, message);
	}

	return parsed.data;
}

export function parseParams<S extends z.AnyZodObject>(ctx: Context, schema: S): z.infer<S> {
	const params = ctx.params;
	const parsed = schema.safeParse(params);
	if (!parsed.success) {
		const message = formatZodErrors(parsed.error);

		ctx.throw(400, message);
	}

	return parsed.data;
}

export function parseQuery<S extends z.AnyZodObject>(ctx: Context, schema: S): z.infer<S> {
	const { query } = ctx.request;

	const parsed = schema.safeParse(query);
	if (!parsed.success) {
		const message = formatZodErrors(parsed.error);

		ctx.throw(400, message);
	}

	return parsed.data;
}

function formatZodErrors(error: z.ZodError): string {
	return error.issues.map(i => {
		const { path, message } = i;
		const combinedPaths     = path.join('->');

		return `${combinedPaths}: ${message}`
	}).join('\n');
}
