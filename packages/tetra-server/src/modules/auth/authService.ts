import { joinURL } from 'ufo';
import { getOrThrow } from '~config';
import { Duration } from '@sapphire/duration';
import { Issuer, generators } from 'openid-client';
import type { Context } from 'koa';
import type { BaseClient } from 'openid-client';

const _configurationUrl      = getOrThrow<string>('auth.configurationUrl');
const _clientId              = getOrThrow<string>('auth.clientId');
const _clientSecret          = getOrThrow<string>('auth.clientSecret');
const _sessionCookieName     = getOrThrow<string>('auth.sessionCookieName');
const _accessTokenCookieName = getOrThrow<string>('auth.accessTokenCookieName');
const _codeVerifier          = generators.codeVerifier();

export const sessionStore = new Map<string, [string, Date]>();

export const callbackUrl = joinURL(getOrThrow<string>('web.url'), 'auth', 'callback');

let _internalIssuer: Issuer<BaseClient>;
export async function getIssuer(): Promise<Issuer<BaseClient>> {
	if (!_internalIssuer) {
		_internalIssuer = await Issuer.discover(_configurationUrl);
	}

	return _internalIssuer;
}

let _internalClient: BaseClient;
export async function getClient(): Promise<BaseClient> {
	if (!_internalClient) {
		const issuer = await getIssuer();
		_internalClient = new issuer.Client({
			client_id: _clientId,
			client_secret: _clientSecret,
			redirect_uris: [callbackUrl],
			response_types: ['code'],
		});
	}

	return _internalClient;
}

export async function createAuthorizationUrl(scope: string): Promise<{ url: string, state: string }> {
	const client         = await getClient();
	const state          = generators.nonce();
	const code_challenge = generators.codeChallenge(_codeVerifier);
	const url            = client.authorizationUrl({
		scope,
		code_challenge,
		state,
		code_challenge_method: 'S256'
	});

	return { url, state };
}

export function isUserInContext(ctx: Context): boolean {
	return 'user' in ctx && ctx.user;
}

export async function destroy(ctx: Context): Promise<void> {
	ctx.cookies.set(_sessionCookieName, null);
	ctx.cookies.set(_accessTokenCookieName, null);
}

export async function setSession(sub: string, accessToken: string): Promise<void> {
	if (!sessionStore.has(sub)) {
		sessionStore.set(sub, [accessToken, new Duration('30 days').fromNow])
	}
}
