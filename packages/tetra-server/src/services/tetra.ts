import Koa                from 'koa';
import { getOrThrow }     from '~config';
import { log }            from '~logger';
import serveStatic        from 'koa-static';
import { STATIC_PATH }    from '~constants';
import { Duration }       from '@sapphire/duration';
import type { ITetraJob } from '@tetra/types';

const _app: Koa          = new Koa();
const _jobs: ITetraJob[] = [];
const _logger            = log.getSubLogger({ name: 'WEB' });

/**
 * The underlying Koa instance that the server runs on
 */
export const app  = _app;
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

	_app.use(createRequestIdMiddleware());
	_app.use(createAuthMiddleware());
	_app.use(createCspMiddleware());
	_app.use(createLoggerMiddleware([
		'/internal/links-count'
	]));
	_app.use(serveStatic(STATIC_PATH));
}

async function _loadRoutes() {
	const { createRootRoutes }     = await import('~controllers/root');
	const { createLinksRoutes }    = await import('~controllers/links');
	const { createInternalRoutes } = await import('~controllers/internal');

	_app.use(createRootRoutes());
	_app.use(createLinksRoutes());
	_app.use(createInternalRoutes());
}

async function _startJobs() {
	const { createTestJob } = await import('~jobs/testJob');

	const jobs = [
		createTestJob()
	];

	for (const job of jobs) {
		_jobs.push(job);

		await job.onRegistered?.();

		setInterval(async () => {
			try {
				await job.execute();
			} catch (err: unknown) {
				_logger.error(`Failed executing job ${job.name}`);
				_logger.error(err);
			} finally {
				job.lastRan = new Date();
				job.nextRun = new Duration(job.interval).fromNow;
			}
		}, new Duration(job.interval).offset);

		_logger.info('Registered job', job.name);
	}
}
