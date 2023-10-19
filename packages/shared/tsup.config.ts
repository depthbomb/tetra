import { createTsupConfig } from '../../tsup.config';

export default createTsupConfig({
	entry: ['./src/*.ts'],
	format: ['cjs', 'esm'],
	tsconfig: './tsconfig.json',
	dts: true,
});
