import { defineConfig } from 'tsup';
import externals from './scripts/externals';
import { builtinModules } from 'node:module';
import { dependencies } from './package.json';

const production = process.env.NODE_ENV === 'production';

export default defineConfig(() => ({
	clean: true,
	entry: ['src/app.ts'],
	noExternal: [
		...Object.keys(dependencies).filter(d => !externals.includes(d)),
		...builtinModules.flatMap(p => [p, `node:${p}`]),
	],
	format: ['cjs'],
	minify: production,
	skipNodeModulesBundle: !production,
	target: 'esnext',
	tsconfig: './tsconfig.json',
	splitting: true,
	sourcemap: !production,
	keepNames: true,
}));
