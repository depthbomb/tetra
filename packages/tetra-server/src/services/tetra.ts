import Koa from 'koa';
import { log } from '~logger';
import { getOrThrow } from '~config';
import serveStatic from 'koa-static';
import { STATIC_PATH } from '~constants';
import { apiResponse } from '@tetra/helpers';
import { Duration } from '@sapphire/duration';
import type { ITetraJob } from '@tetra/types';

const _app: Koa          = new Koa();
const _jobs: ITetraJob[] = [];
const _logger            = log.getSubLogger({ name: 'WEB' });

/**
 * The underlying Koa instance that the server runs on
 */
export const app = _app;
/**
 * The registry of running background jobs.
 */
export const jobs = _jobs;

/**
 * Starts the web server on the port and host as defined in `.tetrarc`
 */
export async function startServer() {
	await _loadMiddleware();
	await _loadRoutes();
	await _startJobs();

	// Register a 404 handler here at the very end of the middleware stack so we can return a consistent response
	_app.use(async (ctx, next) => {
		if (ctx.status === 404) {
			return apiResponse(ctx, {
				status: 404,
				message: 'Not Found'
			}, 404);
		}

		await next();
	});

	_app.listen(
		getOrThrow<number>('web.port'),
		getOrThrow<string>('web.hostname'),
	);
}

async function _loadMiddleware() {
	const { createCspMiddleware }       = await import('~middleware/cspMiddleware');
	const { createAuthMiddleware }      = await import('~middleware/authMiddleware');
	const { createLoggerMiddleware }    = await import('~middleware/loggerMiddleware');
	const { createRequestIdMiddleware } = await import('~middleware/requestIdMiddleware');

	_app.use(serveStatic(STATIC_PATH));
	_app.use(createRequestIdMiddleware());
	_app.use(createAuthMiddleware());
	_app.use(createCspMiddleware());
	_app.use(createLoggerMiddleware());
}

async function _loadRoutes() {
	const { createApiRoutes }            = await import('~controllers/api');
	const { createRootRoutes }           = await import('~controllers/root');
	const { createLinkRedirectionRoute } = await import('~controllers/links');
	const { createInternalRoutes }       = await import('~controllers/internal');

	_app.use(createApiRoutes());
	_app.use(createRootRoutes());
	_app.use(createInternalRoutes());
	_app.use(createLinkRedirectionRoute());
}

async function _startJobs() {
	const { createDeleteExpiredLinksJob } = await import('~jobs/deleteExpiredLinksJob');

	const jobs = [
		createDeleteExpiredLinksJob()
	];

	for (const job of jobs) {
		_jobs.push(job);

		const jobInterval = new Duration(job.interval);

		await job.onRegistered?.();

		setInterval(async () => {
			try {
				await job.execute();
			} catch (err: unknown) {
				_logger.error('Failed executing job', job.name);
				_logger.error(err);
			} finally {
				job.lastRan = new Date();
				job.nextRun = jobInterval.fromNow;
			}
		}, jobInterval.offset);

		_logger.info('Registered job', job.name, 'to start from', jobInterval.fromNow);
	}
}
