import { config } from 'dotenv';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const ENV       = resolve(__dirname, '..', '.env');
const ENV_LOCAL = resolve(__dirname, '..', '.env.local');

if (existsSync(ENV_LOCAL)) {
	console.log(ENV_LOCAL);

	// Prioritize loading local env
	config({ path: ENV_LOCAL });
} else {
	console.log(ENV);

	config({ path: ENV });
}

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
