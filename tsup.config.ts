import { defineConfig } from 'tsup';
import type { Options } from 'tsup';

type CreateTsupConfigOptions = Omit<Options, 'clean' | 'minify' | 'splitting' | 'target'>;

export function createTsupConfig(options: CreateTsupConfigOptions = {}) {
	return defineConfig({
		clean: true,
		minify: false,
		splitting: true,
		target: 'node20',
		...options
	});
}
