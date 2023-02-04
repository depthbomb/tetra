import { getOrThrow } from '~config';
import { sign as $sign, verify as $verify } from 'jsonwebtoken';

const _secret    = getOrThrow<string>('jwt.secret');
const _expiresIn = getOrThrow<string>('jwt.expiresIn');

/**
 * Creates a JWT using the application's configured secret key
 * @param payload The payload to sign
 * @param expiresIn Optional ms-style time string representing when the signed token should expire
 */
export async function signJwt(payload: string | object | Buffer, expiresIn?: string): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			resolve($sign(payload, _secret, { expiresIn: expiresIn ?? _expiresIn }));
		} catch (err: unknown) {
			reject(err);
		}
	});
}

/**
 * Verifies the supplied {@link token} and returns its payload if valid
 * @param token The JWT to verify
 * @returns The signed payload
 */
export async function verifyJwt<T>(token: string): Promise<T> {
	return new Promise((resolve, reject) => {
		$verify(token, _secret, (err, payload) => {
			if (err) {
				reject(err);
			}

			resolve(payload as T);
		});
	});
}
