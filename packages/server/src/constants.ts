import { getVar } from '@env';

export const BASE_URL = getVar<string>('BASE_URL', 'https://go.super.fish')!;

/**
 * The name of the cookie that contains encrypted authenticated user info.
 */
export const AUTH_COOKIE_NAME = 'tetra_user' as const;

/**
 * The name of the cookie that contains a CSRF token.
 */
export const CSRF_COOKIE_NAME = 'tetra_csrf' as const;

/**
 * The name of the cookie used as a nonce for the authentication flow.
 */
export const OIDC_STATE_COOKIE_NAME = 'tetra_oidc_state' as const;
