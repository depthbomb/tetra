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
import { createShortlinkCleanupTask } from '@tasks/shortlinkCleanup';

Features.create('SHORTLINK_CREATION', true);
Features.create('SHORTLINK_REDIRECTION', true);
Features.create('SHORTLINK_CLEANUP', true);
Features.create('AUTHENTICATION', true);
Features.create('HTML_MINIFICATION', true);
Features.create('PRETTY_PRINT_JSON', true);

const app = new Koa({ proxy: true })
	.use(createRequestIdMiddleware())
	.use(createErrorMiddleware())
	.use(createLoggerMiddleware())
	.use(createAuthMiddleware())
	.use(conditional())
	.use(etag())
	.use(createRouter());

registerTask(createShortlinkCleanupTask());

app.listen(getVarOrThrow<number>('PORT'));
