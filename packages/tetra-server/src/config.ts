import { parse }                    from 'json5';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve }            from 'node:path';

const CONFIG_LOAD_ORDER     = ['.tetrarc.dev', '.tetrarc'];
const CONFIG_LOAD_DIRECTORY = resolve(__dirname, '..');

let _internalConfig = {};
let _loadedConfigs  = 0;
for (const configFile of CONFIG_LOAD_ORDER) {
	const configPath = join(CONFIG_LOAD_DIRECTORY, configFile);
	if (existsSync(configPath)) {
		_internalConfig = parse(readFileSync(configPath, 'utf-8'));
		_loadedConfigs++;
		break;
	}
}

if (_loadedConfigs === 0) {
	throw new Error(`Could not load a runtime configuration from the expected directory "${CONFIG_LOAD_DIRECTORY}"`);
}

export function get<T>(key: string): T {
	return key.split('.').reduce((o, i) => o[i], _internalConfig) as T;
}

export function getOrThrow<T>(key: string): T {
	const retval = get<T>(key) as T | undefined;
	if (retval === undefined) {
		throw new Error(`Configuration key "${key}" does not exist`);
	}

	return retval;
}
