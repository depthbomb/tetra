import htmlnano from 'htmlnano';
import { Features } from '@lib/features';
import type { Next, Context } from 'koa';

/**
 * Creates a middleware that minifies HTML responses before it is sent to the client.
 */
export function createHtmlMinMiddleware() {
	return async function(ctx: Context, next: Next) {
		await next();

		const featureEnabled = await Features.isEnabled('HTML_MINIFICATION');

		if (featureEnabled && ctx.response.type === 'text/html') {
			const originalHtml = ctx.body as string;
			const { html } = await htmlnano.process(originalHtml, {
				removeAttributeQuotes: true,
				collapseWhitespace: 'aggressive',
				minifyCss: false,
				minifySvg: false
			});

			ctx.body = html;
		}
	};
}
