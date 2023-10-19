import { createTsupConfig } from '../../tsup.config';

export default createTsupConfig({
	entry: ['./src/index.ts'],
	format: ['cjs', 'esm'],
	tsconfig: './tsconfig.json',
	dts: true,
});
