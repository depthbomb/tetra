import { config } from 'dotenv';
import paths from '@tetra/shared/paths';

config({ path: paths.DOTENV_PATH });

export function getVar<T>(key: string, defaultValue?: T): T | undefined {
	if (!(key in process.env)) {
		return defaultValue;
	}

	return process.env[key] as T;
}

export function getVarOrThrow<T>(key: string): T {
	const retval = getVar<T>(key);
	if (!retval) {
		throw new Error(`No environment variable with key "${key}".`);
	}

	return retval;
}
