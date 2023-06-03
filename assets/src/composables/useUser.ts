export function useUser() {
	const { username, avatar, apiKey, roles } = window.Config.User;
	const isLoggedIn                          = username && avatar && apiKey && roles;
	const isAdmin                             = isLoggedIn && roles.includes('ROLE_ADMIN');

	return {
		username,
		avatar,
		apiKey,
		roles,
		isLoggedIn,
		isAdmin
	};
}
