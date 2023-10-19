import Koa from 'koa';
import etag from 'koa-etag';
import sms from 'source-map-support';
import { registerTask } from '@tasks';
import { createRouter } from '@router';
import { Features } from '@lib/features';
import conditional from 'koa-conditional-get';
import { createAuthMiddleware } from '@middleware/auth';
import { createErrorMiddleware } from '@middleware/error';
import { createLoggerMiddleware } from '@middleware/logger';
import { createFeaturesMiddleware } from '@middleware/features';
import { createRequestIdMiddleware } from '@middleware/requestId';
import { createShortlinkCleanupTask } from '@tasks/shortlinkCleanup';

sms.install();

Features.createFeature('SHORTLINK_CREATION', true);
Features.createFeature('SHORTLINK_REDIRECTION', true);
Features.createFeature('SHORTLINK_CLEANUP', true);
Features.createFeature('AUTHENTICATION', true);

const app = new Koa()
	.use(createRequestIdMiddleware())
	.use(createErrorMiddleware())
	.use(createLoggerMiddleware())
	.use(createAuthMiddleware())
	.use(createFeaturesMiddleware())
	.use(conditional())
	.use(etag())
	.use(createRouter());

registerTask(createShortlinkCleanupTask());

app.listen(3000);
