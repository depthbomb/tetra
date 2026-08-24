import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { URL, fileURLToPath } from 'node:url';
import type { UserConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

let entryID = 0;
let assetID = 0;
let chunkID = 0;

export default defineConfig(({ mode }) => {
	const backendTarget = process.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
	const config: UserConfig = {
		root: projectRoot,
		base: '/',
		css: {
			modules: {
				localsConvention: 'camelCaseOnly',
				generateScopedName: '[local]-[hash]'
			}
		},
		publicDir: fileURLToPath(new URL('./public', import.meta.url)),
		json: {
			stringify: true
		},
		server: {
			proxy: {
				'/api': backendTarget,
				'/go': backendTarget,
				'/health': backendTarget,
				'/oidc': backendTarget,
				'/openapi.json': backendTarget,
				'/ready': backendTarget,
			}
		},
		build: {
			outDir: fileURLToPath(new URL('../dist/frontend', import.meta.url)),
			minify: mode === 'production',
			sourcemap: mode !== 'production',
			emptyOutDir: true,
			rollupOptions: {
				output: {
					hashCharacters: 'hex',
					entryFileNames: () => `${String(entryID++).padStart(3, '0')}-[hash:12].js`,
					assetFileNames: () => `${String(assetID++).padStart(3, '0')}-[hash:12].[ext]`,
					chunkFileNames: () => `${String(chunkID++).padStart(3, '0')}-[hash:12].js`,
				},
			},
		},
		plugins: [
			vue({ script: { propsDestructure: true } }),
			tailwindcss()
		],
		resolve: {
			alias: {
				'~': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
	};

	return config;
});
