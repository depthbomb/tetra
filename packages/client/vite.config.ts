import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import preload from 'vite-plugin-preload';
import { URL, fileURLToPath } from 'node:url';
import type { UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
	const config: UserConfig = {
		base: './',
		root: resolve('./src'),
		publicDir: resolve('./public'),
		json: {
			stringify: true
		},
		build: {
			outDir: resolve(__dirname, '../../packages/server/public'),
			minify: mode === 'production' ? 'esbuild' : false,
			emptyOutDir: true,
			manifest: true,
			assetsInlineLimit: 0,
			rollupOptions: {
				input: resolve('./src/app.ts'),
				output: {
					entryFileNames: '[hash:36].js',
					chunkFileNames: '[hash:36].js',
					assetFileNames: '[hash:36].[ext]',
				},
			},
		},
		plugins: [
			vue({ script: { propsDestructure: true } }),
			preload()
		],
		resolve: {
			alias: {
				'~': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
	};

	return config;
});
