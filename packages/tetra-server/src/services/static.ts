import { createHash } from 'node:crypto';
import { join, extname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { STATIC_PATH, CLIENT_MANIFEST_PATH } from '~constants';

const _internalManifest  = {};
const _internalSriHashes = new Map<string, string[]>();

_loadManifestAssets();

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
