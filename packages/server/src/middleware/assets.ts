import destr from 'destr';
import { joinURL } from 'ufo';
import { flags } from '@flags';
import { BASE_URL } from '@constants';
import { fileExists } from '@utils/fs';
import { readFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import type { Next, Context } from 'koa';

type Assets = {
	[name: string]: string;
}

type Entries = {
	css: string[];
	js: string[];
};

type ManifestJson = {
	[original: string]: {
		file: string;
		src?: string;
		assets?: string[];
		css?: string[];
		imports?: string[];
		dynamicImprots?: string[];
		isDynamicEntry?: boolean;
		isEntry?: boolean;
	}
}

/**
 * Creates a middleware that generates parses the static asset manifest generated by the client's
 * Vite configuration and adds the dictionary to the request state.
 */
export function createAssetsMiddleware() {
	const manifestPath = resolve(__dirname, '..', 'public', 'manifest.json');

	let entries: Entries = { css: [], js: [] };
	let assets: Assets    = {};
	let preload: string[] = [];
	let parsed            = false;

	return async function(ctx: Context, next: Next) {
		if ('assets' in ctx.state && 'preload' in ctx.state && 'entries' in ctx.state) {
			return await next();
		}

		if (!parsed) {
			await parseManifest(ctx);

			if (!flags.dev) {
				// Re-parse the manifest on each request in dev mode
				parsed = true;
			}
		}

		ctx.state.assets  = assets;
		ctx.state.preload = preload;
		ctx.state.entries = entries;

		await next();

		if (flags.dev) {
			entries = { css: [], js: [] };
			assets  = {};
			preload = [];
		}
	};

	async function parseManifest(ctx: Context) {
		const manifestExists = await fileExists(manifestPath);
		if (!manifestExists) {
			throw new Error(`manifest.json not found at expected path: ${manifestPath}.`);
		}

		const json = await readFile(manifestPath, 'utf8');
		const data = destr(json) as ManifestJson;

		for (const key in data) {
			const { file, isDynamicEntry, isEntry, css } = data[key];
			const versionedUrl = joinURL(BASE_URL, file);
			if (isDynamicEntry) {
				preload.push(versionedUrl);
			}

			if (isEntry) {
				if (css) {
					for (const cssEntry of css) {
						entries.css.push(joinURL(BASE_URL, cssEntry));
					}
				}

				entries.js.push(versionedUrl);
			}

			assets[basename(key)] = versionedUrl
		}
	}
}
