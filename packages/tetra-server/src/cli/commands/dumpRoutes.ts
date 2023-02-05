import { joinURL } from 'ufo';
import { join } from 'node:path';
import Router from '@koa/router';
import { Command } from 'clipanion';
import { getOrThrow } from '~config';
import { MONOREPO_ROOT } from '~constants';
import { writeFile } from 'node:fs/promises';
import type { BaseContext } from 'clipanion';

export class DumpRoutesCommand extends Command<BaseContext> {
	public static override paths = [['dump-routes'], ['dr']];

	public async execute(): Promise<number | void> {
		const baseUrl        = getOrThrow<string>('web.url');
		const router         = new Router();
		const routesJson     = [];
		const routesJsonPath = join(MONOREPO_ROOT, 'packages', 'tetra-common', 'src', 'routes.json');

		// This structure should mimic that from tetra.ts#_loadRoutes()

		const { createRootRoutes }     = await import('~controllers/root');
		const { createLinksRoutes }    = await import('~controllers/links');
		const { createInternalRoutes } = await import('~controllers/internal');

		router.use(createRootRoutes());
		router.use(createLinksRoutes());
		router.use(createInternalRoutes());

		for (const { name, methods, paramNames, path } of router.stack) {
			routesJson.push({
				name,
				methods,
				path,
				paramNames,
				url: joinURL(baseUrl, path)
			});
		}

		const json = JSON.stringify(routesJson);

		try {
			await writeFile(routesJsonPath, json, 'utf-8');

			this.context.stdout.write(`Dumped route info to ${routesJsonPath}\n`);
		} catch (err: unknown) {
			this.context.stderr.write('Failed to dump route info:\n');
			this.context.stderr.write(err.toString());
		}
	}
}
