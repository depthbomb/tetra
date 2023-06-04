import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { exec } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import type { UserConfig } from 'vite';

const distPath = resolve('..', 'public', 'assets');

export default defineConfig(({ mode }) => {
	const config: UserConfig = {
		base: './',
		root: resolve('./src'),
		publicDir: resolve('./public'),
		json: {
			stringify: true
		},
		build: {
			outDir: distPath,
			minify: mode === 'production' ? 'esbuild' : false,
			emptyOutDir: true,
			manifest: true,
			assetsInlineLimit: 0,
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
			vue({ script: { propsDestructure: true } }),
			{
				name: 'generate service',
				async closeBundle() {
					exec('php ../bin/console tetra:assets:generate-service', (err, stdout, stderr) => {
						if (err) return console.log(err);
					});
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
