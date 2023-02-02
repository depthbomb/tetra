import { defineConfig }   from 'tsup';
import { builtinModules } from 'node:module';
import { dependencies }   from './package.json';
import externals          from './scripts/externals';

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
	target: 'node18',
	tsconfig: './tsconfig.json',
	splitting: false,
	sourcemap: !production,
	keepNames: true,
}));
