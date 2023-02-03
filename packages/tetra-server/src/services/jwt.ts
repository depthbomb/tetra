import { getOrThrow } from '~config';
import { sign as $sign, verify as $verify } from 'jsonwebtoken';

const _secret    = getOrThrow<string>('jwt.secret');
const _expiresIn = getOrThrow<string>('jwt.expiresIn');

export async function signJwt(payload: string | object | Buffer, expiresIn?: string): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			resolve($sign(payload, _secret, { expiresIn: expiresIn ?? _expiresIn }));
		} catch (err: unknown) {
			reject(err);
		}
	});
}

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
