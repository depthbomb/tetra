import { parse } from 'json5';
import { join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const CONFIG_LOAD_DIRECTORY = resolve(__dirname, '..');

let _internalConfig = {};

export async function loadConfig(configNames: string[]): Promise<void> {
	let foundConfig = false;
	for (const configFile of configNames) {
		const configPath = join(CONFIG_LOAD_DIRECTORY, configFile);
		if (existsSync(configPath)) {
			_internalConfig = parse(readFileSync(configPath, 'utf-8'));
			foundConfig = true;
			break;
		}
	}

	if (!foundConfig) {
		throw new Error(`Could not load a runtime configuration from the expected directory "${CONFIG_LOAD_DIRECTORY}"`);
	}
}

/**
 * Retrieves a configuration value from the application's runtime config
 * @param key Dot notation-based key of the config value to retrieve
 * @returns The config property value if it exists, `undefined` otherwise
 */
export function get<T>(key: string): T | undefined {
	return key.split('.').reduce((o, i) => o[i], _internalConfig) as T;
}

/**
 * Like {@link get} but throws an error if the value does not exist
 * @param key Dot notation-based key of the config value to retrieve
 * @returns The config property value
 */
export function getOrThrow<T>(key: string): T {
	const retval = get<T>(key);
	if (retval === undefined) {
		throw new Error(`Configuration key "${key}" does not exist`);
	}

	return retval;
}

/**
 * Gets a value from the process's environment variables
 * @param name The name of the environment variable passed to the process
 * @returns The environment variable value of {@link name}, `undefined` otherwise
 */
export function getEnv<T>(name: string): T | undefined {
	return process.env[name] as T;
}


export function getEnvOrThrow<T>(name: string): T {
	const retval = getEnv<T>(name);
	if (retval === undefined) {
		throw new Error(`Environment variable "${name}" does not exist`)
	}

	return retval;
}
