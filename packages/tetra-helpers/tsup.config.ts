import { defineConfig }   from 'tsup';
import { builtinModules } from 'node:module';

const production = process.env.NODE_ENV === 'production';

export default defineConfig(() => ({
	clean: true,
	entry: ['src/index.ts'],
	noExternal: [
		...builtinModules.flatMap(p => [p, `node:${p}`]),
	],
	format: ['cjs', 'esm'],
	minify: production,
	skipNodeModulesBundle: !production,
	target: 'esnext',
	tsconfig: './tsconfig.json',
	dts: true,
	splitting: true,
	sourcemap: true,
	keepNames: true,
}));
