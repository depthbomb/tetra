import destr from 'destr';
import { getVarOrThrow } from '@env';
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

export class Crypto {
	private static readonly _ivLength = 16 as const;
	private static readonly _algo     = 'aes-256-cbc' as const;
	private static readonly _key      = getVarOrThrow<string>('ENCRYPTION_KEY');

	private constructor() { }

	public static encryptString(input: string) {
		const key    = this._getKeyBytes(this._key);
		const iv     = Buffer.from(randomBytes(this._ivLength));
		const cipher = createCipheriv(this._algo, Buffer.from(key), iv);

		let encrypted = cipher.update(input);
		encrypted = Buffer.concat([encrypted, cipher.final()]);

		const json = JSON.stringify({
			i: iv.toString('hex'),
			p: encrypted.toString('base64')
		});

		return Buffer.from(json).toString('base64url');
	}

	public static decryptString(input: string): string {
		const key                   = this._getKeyBytes(this._key);
		const decodedInput          = Buffer.from(input, 'base64url').toString();
		const { i: iv, p: payload } = destr<{ i: string; p: string; }>(decodedInput);
		const decipher              = createDecipheriv(this._algo, key, Buffer.from(iv, 'hex'));

		let decrypted = decipher.update(Buffer.from(payload, 'base64'));
		decrypted = Buffer.concat([decrypted, decipher.final()]);

		return decrypted.toString('utf8');
	}

	private static _getKeyBytes(key: string): Buffer {
		return Buffer.from(key, 'hex');
	}
}
