import { getOrThrow } from '~config';
import { watch } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, extname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { configure, renderFileAsync } from 'eta';
import { existsSync, readFileSync } from 'node:fs';
import { VIEWS_PATH, STATIC_PATH, CLIENT_MANIFEST_PATH } from '~constants';

const _production        = !getOrThrow<boolean>('development');
const _internalManifest  = {};
const _internalSriHashes = new Map<string, string[]>();

_loadManifestAssets();

configure({
	async: true,
	cache: _production,
	views: VIEWS_PATH,
	autoTrim: _production ? ['nl', 'slurp'] : false,
	rmWhitespace: _production,
});

if (getOrThrow<boolean>('development')) {
	(async() => {
		const watcher = watch(CLIENT_MANIFEST_PATH);
		for await (const event of watcher) {
			if (event.eventType === 'change') {
				_loadManifestAssets();
			}
		}
	})();
}

/**
 * Renders an [Eta](https://eta.js.org/)-based view template file to HTML
 * @param name The name of the view relative to the `views` directory minus extension
 * @param viewData An object containing data that will be passed and accessible in the rendered view
 * @returns The rendered view HTML content
 */
export async function renderView(name: string, viewData: object): Promise<string> {
	return await renderFileAsync(name, viewData);
}

/**
 * Generates an HTML tag linking to the versioned asset from the {@link originalPath}
 * @param originalPath The original path of the asset as defined in the manifest.json file
 * @param cspNonce Optional CSP nonce to include in the generated HTML tag
 */
export async function generateVersionedAssetTag(originalPath: string, cspNonce?: string): Promise<string> {
	const fileName  = await _getVersionedFileName(originalPath);
	const sriHashes = await _generateSriHashesForAsset(originalPath);
	const fileExt   = extname(fileName);
	switch (fileExt) {
		case '.js':
			return `<script src="/${fileName}" type="module" crossorigin="anonymous" integrity="${sriHashes.join(' ')}" ${
				cspNonce !== null ? `nonce="${cspNonce}"` : ''
			}></script>`;
		case '.css':
			return `<link href="/${fileName}" rel="stylesheet" crossorigin="anonymous" integrity="${sriHashes.join(' ')}">`;
		default:
			return '';
	}
}

async function _getVersionedFileName(originalPath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		if (originalPath in _internalManifest) {
			const versionedName = _internalManifest[originalPath].file;

			resolve(versionedName);
		} else {
			reject(`Manifest does not have an asset entry with the key "${originalPath}"`);
		}
	});
}

async function _getVersionedFilePath(originalPath: string): Promise<string> {
	const fileName = await _getVersionedFileName(originalPath);

	return join(STATIC_PATH, fileName);
}

async function _generateSriHashesForAsset(originalPath: string): Promise<string[]> {
	if (!_internalSriHashes.has(originalPath)) {
		const hashes: string[] = [];
		const filePath         = await _getVersionedFilePath(originalPath);
		const buf              = await readFile(filePath);

		for (const algo of ['sha256', 'sha384', 'sha512']) {
			const hash = createHash(algo).update(buf).digest('base64');
			hashes.push(`${algo}-${hash}`);
		}

		_internalSriHashes.set(originalPath, hashes);
	}

	return _internalSriHashes.get(originalPath);
}

function _loadManifestAssets(): void {
	if (existsSync(CLIENT_MANIFEST_PATH)) {
		const manifestContents = readFileSync(CLIENT_MANIFEST_PATH, 'utf8');

		_internalSriHashes.clear();
		Object.assign(_internalManifest, { ...JSON.parse(manifestContents) });
	} else {
		throw new Error(`Client asset manifest not found at expected path "${CLIENT_MANIFEST_PATH}"`);
	}
}

