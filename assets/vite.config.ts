import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { existsSync } from 'node:fs';
import preload from 'vite-plugin-preload';
import { join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { unlink, readFile, writeFile } from 'node:fs/promises';
import type { UserConfig } from 'vite';

const distPath    = resolve('..', 'public', 'assets');
const servicePath = resolve('..', 'src', 'Service', 'StaticService.php');

const randomID = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export default defineConfig(({ mode }) => {
	const config: UserConfig = {
		base: './',
		root: resolve('./src'),
		publicDir: resolve('./public'),
		build: {
			outDir: distPath,
			minify: mode === 'production' ? 'esbuild' : false,
			emptyOutDir: true,
			manifest: true,
			rollupOptions: {
				input: resolve('./src/app.ts'),
				output: {
					entryFileNames: 'entry-[hash:32].js',
					chunkFileNames: 'chunk-[hash:32].js',
					assetFileNames: 'asset-[hash:32].[ext]',
				},
			},
		},
		plugins: [
			vue(),
			preload(),
			{
				// This "plugin" generates a PHP class for the backend that allows for retrieving
				// versioned assets via hardcoded values.
				name: 'generate-backend-service',
				async closeBundle() {
					const manifestPath           = join(distPath, 'manifest.json');

					if (!existsSync(manifestPath)) {
						return;
					}

					const json                   = await readFile(manifestPath, 'utf-8');
					const manifest               = JSON.parse(json);
					const newManifest: any       = { assets: [] };
					const preload: string[]      = [];
					const entries: string[]      = [];
					const assetsVariableName     = '_' + randomID().toUpperCase();
					const jsEntriesVariableName  = '_' + randomID().toUpperCase();
					const cssEntriesVariableName = '_' + randomID().toUpperCase();
					const preloadVariableName    = '_' + randomID().toUpperCase();
					for (const originalPath in manifest) {
						const asset = manifest[originalPath];

						if (!asset.isEntry && !preload.includes(asset.file)) {
							preload.push(asset.file);
						} else {
							if ('css' in asset) {
								for (const css of asset.css) {
									entries.push(css);
								}
							}

							entries.push(asset.file);
						}

						newManifest.assets.push({
							o: originalPath,
							v: asset.file,
						});
					}

					newManifest.entries = entries;
					newManifest.preload = preload;

					const serviceTemplate = `
<?php namespace App\\Service;

/**
 * This class is auto-generated from the static asset build process. *DO NOT* modify directly.
 */
final class StaticService
{
	private const ${assetsVariableName} = [${newManifest.assets.map((a: any) => `'${a.o}'=>'${a.v}'`)}];
	private const ${jsEntriesVariableName} = [${newManifest.entries.map((a: string) => {
		if (a.endsWith('.js')) {
			return `'/assets/${a}'`;
		}
	}).filter((a: string) => a !== undefined)}];
	private const ${cssEntriesVariableName} = [${newManifest.entries.map((a: string) => {
		if (a.endsWith('.css')) {
			return `'/assets/${a}'`;
		}
	}).filter((a: string) => a !== undefined)}];
	private const ${preloadVariableName} = [${newManifest.preload.map((a: string) => {
		if (a.endsWith('.js')) {
			return `'/assets/${a}'`;
		}
	}).filter((a: string) => a !== undefined)}];

	public function getVersioned(string $original_name): ?string
	{
		return '/assets/'.$this::${assetsVariableName}[$original_name];
	}

	public function getEntries(string $type = 'js'): array
	{
		switch ($type)
		{
			default:
			case 'js':
			case 'ts':
				return $this::${jsEntriesVariableName};
			case 'css':
			case 'scss':
				return $this::${cssEntriesVariableName};
		}
	}

	public function getPreload(): array
	{
		return $this::${preloadVariableName};
	}
}`.trim();

					await writeFile(servicePath, serviceTemplate, 'utf8');

					if (existsSync(manifestPath)) {
						await unlink(manifestPath);
					}
				},
			},
		],
		resolve: {
			alias: {
				'~': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
	};

	return config;
});
