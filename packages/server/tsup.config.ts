import { createTsupConfig } from '../../tsup.config';

export default createTsupConfig({
	entry: ['./src/index.ts'],
	format: ['cjs'],
	dts: false,
	tsconfig: './tsconfig.json',
	sourcemap: true,
});
