import { existsSync, readFileSync }          from 'node:fs';
import { join, extname }                     from 'node:path';
import { STATIC_PATH, CLIENT_MANIFEST_PATH } from '~constants';
import { createHash }                        from 'node:crypto';
import { Logger, Injectable }                from '@nestjs/common';
import { readFile }                          from 'node:fs/promises';
import type { IClientManifest }              from '~@types/IClientManifest';

@Injectable()
export class SpaService {
    private readonly _manifest: IClientManifest;
    private readonly _logger: Logger;
    private readonly _sriHashes: Map<string, string[]>;

    public constructor() {
        this._logger    = new Logger(SpaService.name);
        this._sriHashes = new Map<string, string[]>();

        if (existsSync(CLIENT_MANIFEST_PATH)) {
            const manifestContents = readFileSync(CLIENT_MANIFEST_PATH, 'utf8');

            this._manifest = JSON.parse(manifestContents);
            this._logger.log(`Loaded client asset manifest ${CLIENT_MANIFEST_PATH}`);
        } else {
            throw new Error(`Client asset manifest not found at expected path "${CLIENT_MANIFEST_PATH}"`);
        }
    }

    public async generateVersionedAssetTag(originalPath: string, cspNonce?: string): Promise<string> {
        const fileName  = await this._getVersionedFileName(originalPath);
        const sriHashes = await this._generateSriHashesForAsset(originalPath);
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

    private async _getVersionedFileName(originalPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (originalPath in this._manifest) {
                const versionedName = this._manifest[originalPath].file;

                resolve(versionedName);
            } else {
                reject(`Manifest does not an asset entry with the key "${originalPath}"`);
            }
        });
    }

    private async _getVersionedFilePath(originalPath: string): Promise<string> {
        const fileName = await this._getVersionedFileName(originalPath);

        return join(STATIC_PATH, fileName);
    }

    private async _generateSriHashesForAsset(originalPath: string): Promise<string[]> {
        if (!this._sriHashes.has(originalPath)) {
            this._logger.debug(`Generating fresh SRI hashes for "${originalPath}"`);

            const hashes: string[] = [];
            const filePath         = await this._getVersionedFilePath(originalPath);
            const buf              = await readFile(filePath);

            for (const algo of ['sha256', 'sha384', 'sha512']) {
                const hash = createHash(algo).update(buf).digest('base64');
                hashes.push(`${algo}-${hash}`);
            }

            this._sriHashes.set(originalPath, hashes);
        }

        return this._sriHashes.get(originalPath);
    }
}
