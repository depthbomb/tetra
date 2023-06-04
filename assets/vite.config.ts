import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
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
		],
		resolve: {
			alias: {
				'~': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
	};

	return config;
});
