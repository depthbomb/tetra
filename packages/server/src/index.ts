import 'source-map-support/register';
import Koa from 'koa';
import etag from 'koa-etag';
import { getVarOrThrow } from '@env';
import { registerTask } from '@tasks';
import { createRouter } from '@router';
import { Features } from '@lib/features';
import conditional from 'koa-conditional-get';
import { createAuthMiddleware } from '@middleware/auth';
import { createErrorMiddleware } from '@middleware/error';
import { createLoggerMiddleware } from '@middleware/logger';
import { createRequestIdMiddleware } from '@middleware/requestId';
import { createPruneRateLimitsTask } from '@tasks/pruneRateLimits';
import { createShortlinkCleanupTask } from '@tasks/shortlinkCleanup';

async function boot() {
	await Features.create('SHORTLINK_CREATION', true);
	await Features.create('SHORTLINK_REDIRECTION', true);
	await Features.create('SHORTLINK_CLEANUP', true);
	await Features.create('AUTHENTICATION', true);
	await Features.create('HTML_MINIFICATION', true);
	await Features.create('PRETTY_PRINT_JSON', true);

	const app = new Koa({ proxy: true })
		.use(createRequestIdMiddleware())
		.use(createErrorMiddleware())
		.use(createLoggerMiddleware())
		.use(createAuthMiddleware())
		.use(conditional())
		.use(etag())
		.use(await createRouter());

	await registerTask(createShortlinkCleanupTask());
	await registerTask(createPruneRateLimitsTask());

	app.listen(getVarOrThrow<number>('PORT'));
}

boot();
