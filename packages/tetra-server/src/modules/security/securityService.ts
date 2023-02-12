import { getOrThrow } from '~config';
import { signJwt, verifyJwt } from '~modules/jwt';
import type { Context } from 'koa';
import type { ICsrfTokenPayload } from '@tetra/common';

const _cryptoSalt = getOrThrow<string>('crypto.salt');

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
