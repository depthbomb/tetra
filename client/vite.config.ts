import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import imagemin from 'vite-plugin-imagemin';
import { fileURLToPath, URL } from 'node:url';
import type { UserConfig }  from 'vite';
import { readFile, writeFile } from 'node:fs/promises';

const distPath = resolve('..', 'Tetra', 'wwwroot');

export default defineConfig(({ mode }) => {
	const config: UserConfig = {
		base: './',
		root: resolve('./src'),
		publicDir: resolve('./public'),
		build: {
			manifest: true,
			emptyOutDir: true,
			outDir: distPath,
			minify: mode === 'production' ? 'esbuild' : false,
			rollupOptions: {
				input: resolve('./src/app.ts'),
				output: {
					entryFileNames: '[name]-[hash:32].js',
					chunkFileNames: '[name]-[hash:32].js',
					assetFileNames: '[name]-[hash:32].[ext]',
				}
			},
		},
		plugins: [
			vue(),
			{
				// This "plugin" simplifies the manifest file to a format that is more easily parsed
				// by the backend.
				name: 'transform-manifest',
				async closeBundle() {
					const manifestPath = resolve(distPath, 'manifest.json');
					const json         = await readFile(manifestPath, 'utf-8');
					const manifest     = JSON.parse(json);
					const newManifest  = [];
					for (const originalPath in manifest) {
						const asset = manifest[originalPath];
						newManifest.push({
							o: originalPath,
							v: asset.file,
						});
					}

					await writeFile(manifestPath, JSON.stringify(newManifest), 'utf8');
				},
			}
		],
		resolve: {
			alias: {
				'~': fileURLToPath(new URL('./src', import.meta.url))
			}
		}
	};

	if (mode === 'production') {
		config.plugins!.push(imagemin({
			gifsicle: {
				optimizationLevel: 3,
			},
			mozjpeg: {
				quality: 100,
			},
			pngquant: {
				quality: [0.8, 1.0],
				speed: 3,
			},
			svgo: {
				plugins: [
					{
						name: 'removeViewBox',
					},
					{
						name: 'removeEmptyAttrs',
						active: false,
					},
				],
			},
		}));
	}

	return config;
});
