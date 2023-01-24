import argon2                                            from 'argon2';
import { promisify }                                     from 'node:util';
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { Injectable }                                    from '@nestjs/common';
import { ConfigService }                                 from '@nestjs/config';
import type { Cipher }                                   from 'node:crypto';

@Injectable()
export class CryptoService {
    private readonly _key: string;
    private readonly _salt: string;

    public constructor(config: ConfigService) {
        this._key  = config.getOrThrow<string>('CRYPTO_KEY');
        this._salt = config.getOrThrow<string>('CRYPTO_SALT');
    }

    public async createPasswordHash(input: string): Promise<string> {
        return argon2.hash(input, {
            salt: Buffer.from(this._salt),
            saltLength: this._salt.length
        });
    }

    public async verifyPassword(plaintext: string, password: string): Promise<boolean> {
        return argon2.verify(password, plaintext, {
            salt: Buffer.from(this._salt),
            saltLength: this._salt.length
        });
    }

    public async encrypt(input: string): Promise<string> {
        const key    = await this._getKeyBytes(this._key);
        const iv     = await this._generateIv();
        const cipher = await this._generateCipher(iv, key);

        let encrypted = cipher.update(input);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

        return JSON.stringify({
            iv,
            pl: encrypted.toString('base64')
        });
    }

    public async decrypt(input: string): Promise<string> {
        const key      = await this._getKeyBytes(this._key);
        const decoded  = JSON.parse(input);
        const iv       = Buffer.from(decoded.iv, 'binary');
        const pl       = Buffer.from(decoded.pl, 'base64');
        const decipher = createDecipheriv('aes-256-cbc', key, iv);

        let decrypted = decipher.update(pl);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

        return String(decrypted);
    }

    private async _getKeyBytes(key: string): Promise<Buffer> {
        return Buffer.from(key, 'base64');
    }

    private async _generateCipher(iv: string, key: Buffer): Promise<Cipher> {
        return createCipheriv('aes-256-cbc', key, iv);
    }

    private async _generateIv(size: number = 16): Promise<string> {
        const buf = await promisify(randomBytes)(size);
        return buf.toString('hex').slice(0, size);
    }
}
