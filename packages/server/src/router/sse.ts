import Router from '@koa/router';
import { PassThrough } from 'stream';
import { createCsrfMiddleware } from '@middleware/csrf';
import { counterEvent, emitShortlinkCount } from '@events/shortlinks';
import type { Context } from 'koa';

export function createSseRouter() {
	const router  = new Router({ prefix: '/sse' });
	const clients = new Set<string>();

	/*
	|--------------------------------------------------------------------------
	| Routes
	|--------------------------------------------------------------------------
	*/

	router.get('/shortlink_count', createCsrfMiddleware('validate'), async (ctx: Context) => {
		const { ip } = ctx;

		ctx.assert(!clients.has(ip), 409);

		clients.add(ip);

		ctx.request.socket.setTimeout(0);
		ctx.req.socket.setNoDelay(true);
		ctx.req.socket.setKeepAlive(true);

		ctx.set({
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
		});

		const stream = new PassThrough();
		ctx.status   = 200;
		ctx.body     = stream;

		const sendCount = (count: number) => stream.write(`data: ${count}\n\n`);

		counterEvent.on('shortlinkCount', sendCount);
		stream.once('close', () => {
			counterEvent.off('shortlinkCount', sendCount);
			clients.delete(ip);
		});

		// Emit the initial shortlink count
		await emitShortlinkCount();
	});

	return router.routes();
}
