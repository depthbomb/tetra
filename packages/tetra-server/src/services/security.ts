import argon2 from 'argon2';
import { getOrThrow } from '~config';
import { signJwt, verifyJwt } from '~services/jwt';
import type { Context } from 'koa';
import type { ICsrfTokenPayload } from '@tetra/types';

const _cryptoSalt = getOrThrow<string>('crypto.salt');

export async function hashPassword(input: string): Promise<string> {
	return argon2.hash(input, {
		salt: Buffer.from(_cryptoSalt),
		saltLength: _cryptoSalt.length
	});
}

export async function verifyPassword(plaintext: string, password: string): Promise<boolean> {
	return argon2.verify(password, plaintext, {
		salt: Buffer.from(_cryptoSalt),
		saltLength: _cryptoSalt.length
	});
}

export async function createCsrfToken(ctx: Context): Promise<string> {
	return signJwt({ ip: ctx.request.ip });
}

export async function verifyCsrfToken(token: string, ctx: Context): Promise<boolean> {
	try {
		const { ip } = await verifyJwt<ICsrfTokenPayload>(token);
		return ctx.request.ip === ip;
	} catch {
		return false;
	}
}
