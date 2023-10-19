import { getVarOrThrow } from '@env';
import { Crypto } from '@utils/crypto';
import { Duration } from '@sapphire/duration';
import { Issuer, generators } from 'openid-client';
import { OIDC_STATE_COOKIE_NAME } from '@constants';
import type { Context } from 'koa';
import type { Client } from 'openid-client';

export class OAuth {
	private static _issuer: Issuer<Client> | null = null;
	private static _client: Client | null         = null;
	private static readonly _clientId             = getVarOrThrow<string>('OIDC_CLIENT_ID');
	private static readonly _clientSecret         = getVarOrThrow<string>('OIDC_CLIENT_SECRET');
	private static readonly _issuerUrl            = getVarOrThrow<string>('OIDC_ISSUER_URL');

	private constructor() {}

	public static get client() {
		return this._client;
	}

	public static async getAuthUrl(ctx: Context): Promise<string> {
		const client        = await this._getClient();
		const codeVerifier  = generators.codeVerifier();
		const codeChallenge = generators.codeChallenge(codeVerifier);
		const cookieExpires = new Duration('2 minutes').fromNow;

		ctx.cookies.set(OIDC_STATE_COOKIE_NAME, Crypto.encryptString(codeVerifier), {
			httpOnly: true,
			expires: cookieExpires
		});

		return client.authorizationUrl({
			scope:                 'openid email profile groups',
			code_challenge:        codeChallenge,
			code_challenge_method: 'S256',
			state:                 codeVerifier,
			redirect_uri:          'http://localhost:3000/oidc/callback'
		});
	}

	private static async _getClient(): Promise<Client> {
		if (!this._client) {
			const issuer = await this._getIssuer();

			this._client = new issuer.Client({
				client_id: this._clientId,
				client_secret: this._clientSecret,
				response_types: ['code']
			});
		}

		return this._client;
	}

	private static async _getIssuer(): Promise<Issuer<Client>> {
		if (!this._issuer) {
			this._issuer = await Issuer.discover(this._issuerUrl);
		}

		return this._issuer;
	}
}
