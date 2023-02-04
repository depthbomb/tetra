import argon2 from 'argon2';
import { getOrThrow } from '~config';
import { signJwt, verifyJwt } from '~services/jwt';
import type { Context } from 'koa';
import type { ICsrfTokenPayload } from '@tetra/types';

const _cryptoSalt = getOrThrow<string>('crypto.salt');

/**
 * Hashes the plaintext {@link input} with argon2 using the application's configured salt value
 * @param input The plaintext password to hash
 */
export async function hashPassword(input: string): Promise<string> {
	return argon2.hash(input, {
		salt: Buffer.from(_cryptoSalt),
		saltLength: _cryptoSalt.length
	});
}

/**
 * Verifies if the {@link plaintext} password matches the hashed {@link password} variant
 * @param plaintext The plaintext password
 * @param password The hashed password
 * @returns `true` if the {@link plaintext} password matches the hashed {@link password}, `false` otherwise
 *
 * @see {@link hashPassword}
 */
export async function verifyPassword(plaintext: string, password: string): Promise<boolean> {
	return argon2.verify(password, plaintext, {
		salt: Buffer.from(_cryptoSalt),
		saltLength: _cryptoSalt.length
	});
}

/**
 * Creates a simple JWT using a request IP to act as a CSRF token
 * @param ctx The Koa {@link Context}
 */
export async function createCsrfToken(ctx: Context): Promise<string> {
	return signJwt({ ip: ctx.request.ip });
}

/**
 * Verifies that the payload in the JWT-based CSRF {@link token} matches the request IP from the {@link ctx}
 * @param token The JWT-based CSRF token
 * @param ctx The Koa {@link Context}
 * @returns `true` if the request IP from the {@link ctx} matches the IP in the payload of the {@link token}, `false` otherwise
 */
export async function verifyCsrfToken(token: string, ctx: Context): Promise<boolean> {
	try {
		const { ip } = await verifyJwt<ICsrfTokenPayload>(token);
		return ctx.request.ip === ip;
	} catch {
		return false;
	}
}
