/**
 * The name of the cookie that contains encrypted authenticated user info.
 */
export const AUTH_COOKIE_NAME = 'tetra_user' as const;

/**
 * The name of the cookie used as a nonce for the authentication flow.
 */
export const OIDC_STATE_COOKIE_NAME = 'oidc_state' as const;
